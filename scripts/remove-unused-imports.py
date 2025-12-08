#!/usr/bin/env python3
"""
Automated script to remove unused imports from Java files.
This helps fix java:S6813 SonarQube issues.

Usage: python3 scripts/remove-unused-imports.py <file_path>
       python3 scripts/remove-unused-imports.py --all (processes all Java files)
"""

import re
import sys
import os
from pathlib import Path

def analyze_import_usage(file_path):
    """Analyze which imports are actually used."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract all imports
        import_pattern = re.compile(r'^import\s+(?:static\s+)?([^;]+);', re.MULTILINE)
        imports = []
        for match in import_pattern.finditer(content):
            import_stmt = match.group(1).strip()
            imports.append(import_stmt)
        
        if not imports:
            return [], []
        
        # Remove import section for analysis
        content_without_imports = re.sub(r'^import\s+.*?;', '', content, flags=re.MULTILINE)
        
        unused = []
        used = []
        
        for imp in imports:
            # Get class name (last part)
            if imp.endswith('.*'):
                # Wildcard import - keep it for now
                used.append(imp)
                continue
            
            class_name = imp.split('.')[-1]
            
            # Check if class name appears in code (but not in comments)
            # Simple heuristic: look for the class name as a word boundary
            pattern = r'\b' + re.escape(class_name) + r'\b'
            
            # Check in non-comment, non-string code
            lines = content_without_imports.split('\n')
            found = False
            for line in lines:
                stripped = line.strip()
                # Skip comments
                if stripped.startswith('//') or stripped.startswith('*') or stripped.startswith('/*'):
                    continue
                # Check if class name appears
                if re.search(pattern, line):
                    found = True
                    break
            
            if found:
                used.append(imp)
            else:
                unused.append(imp)
        
        return used, unused
    
    except Exception as e:
        print(f"Error analyzing {file_path}: {e}")
        return [], []

def remove_unused_imports(file_path):
    """Remove unused imports from a file."""
    used, unused = analyze_import_usage(file_path)
    
    if not unused:
        return False, 0
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remove unused imports
        for imp in unused:
            pattern = r'^import\s+(?:static\s+)?' + re.escape(imp) + r'\s*;\s*$'
            content = re.sub(pattern, '', content, flags=re.MULTILINE)
        
        # Clean up multiple blank lines
        content = re.sub(r'\n\n\n+', '\n\n', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, len(unused)
        
        return False, 0
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False, 0

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == '--all':
        # Process all Java files
        root_dir = 'apps/backend/src/main/java'
        java_files = []
        for root, dirs, files in os.walk(root_dir):
            if 'test' in root or 'target' in root:
                continue
            for file in files:
                if file.endswith('.java'):
                    java_files.append(os.path.join(root, file))
        
        total_removed = 0
        files_modified = 0
        
        for file_path in java_files:
            modified, count = remove_unused_imports(file_path)
            if modified:
                files_modified += 1
                total_removed += count
                print(f"Removed {count} unused imports from {file_path}")
        
        print(f"\nSummary: Modified {files_modified} files, removed {total_removed} unused imports")
    else:
        if len(sys.argv) < 2:
            print("Usage: python3 scripts/remove-unused-imports.py <file_path>")
            print("   or: python3 scripts/remove-unused-imports.py --all")
            sys.exit(1)
        
        file_path = sys.argv[1]
        modified, count = remove_unused_imports(file_path)
        if modified:
            print(f"Removed {count} unused imports from {file_path}")
        else:
            print(f"No unused imports found in {file_path}")
