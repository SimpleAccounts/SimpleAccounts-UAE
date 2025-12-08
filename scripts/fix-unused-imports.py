#!/usr/bin/env python3
"""
Script to identify and remove unused imports from Java files.
This helps fix java:S6813 SonarQube issues.
"""

import re
import os
import sys

def find_java_files(root_dir):
    """Find all Java files in the directory."""
    java_files = []
    for root, dirs, files in os.walk(root_dir):
        # Skip test directories and build directories
        if 'test' in root or 'target' in root or 'build' in root:
            continue
        for file in files:
            if file.endswith('.java'):
                java_files.append(os.path.join(root, file))
    return java_files

def extract_imports(content):
    """Extract all import statements from Java file."""
    imports = []
    import_pattern = re.compile(r'^import\s+(?:static\s+)?([^;]+);', re.MULTILINE)
    for match in import_pattern.finditer(content):
        imports.append(match.group(1).strip())
    return imports

def extract_package(content):
    """Extract package name."""
    match = re.search(r'^package\s+([^;]+);', re.MULTILINE)
    return match.group(1) if match else None

def is_import_used(import_stmt, content, package_name):
    """Check if an import is actually used in the code."""
    # Remove 'static' keyword if present
    import_path = import_stmt.replace('static ', '').strip()
    
    # Get the class name (last part after dot)
    class_name = import_path.split('.')[-1]
    
    # Handle wildcard imports
    if import_path.endswith('.*'):
        # For wildcard imports, we can't easily determine usage
        # So we'll be conservative and keep them
        return True
    
    # Check if class name appears in the code (but not in import statements)
    # Remove import statements from content for checking
    content_without_imports = re.sub(r'^import\s+.*?;', '', content, flags=re.MULTILINE)
    
    # Check for class name usage
    # Make sure it's not part of a package name or another import
    pattern = r'\b' + re.escape(class_name) + r'\b'
    
    # Special handling for common cases
    if class_name in ['List', 'Map', 'Set', 'ArrayList', 'HashMap', 'HashSet']:
        # These are commonly used, check more carefully
        if re.search(pattern, content_without_imports):
            return True
    
    # Check if it's used as a type, in method calls, etc.
    if re.search(pattern, content_without_imports):
        # Make sure it's not just in comments
        lines = content_without_imports.split('\n')
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('//') or stripped.startswith('*'):
                continue
            if re.search(pattern, line):
                return True
    
    return False

def remove_unused_imports(file_path):
    """Remove unused imports from a Java file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        package_name = extract_package(content)
        imports = extract_imports(content)
        
        if not imports:
            return False, 0
        
        unused_imports = []
        for imp in imports:
            if not is_import_used(imp, content, package_name):
                unused_imports.append(imp)
        
        if not unused_imports:
            return False, 0
        
        # Remove unused imports
        for imp in unused_imports:
            # Match the exact import line
            pattern = r'^import\s+(?:static\s+)?' + re.escape(imp) + r'\s*;?\s*$'
            content = re.sub(pattern, '', content, flags=re.MULTILINE)
        
        # Clean up multiple blank lines
        content = re.sub(r'\n\n\n+', '\n\n', content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, len(unused_imports)
        
        return False, 0
    
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False, 0

def main():
    """Main function."""
    if len(sys.argv) > 1:
        root_dir = sys.argv[1]
    else:
        root_dir = 'apps/backend/src/main/java'
    
    print(f"Scanning Java files in {root_dir}...")
    java_files = find_java_files(root_dir)
    print(f"Found {len(java_files)} Java files")
    
    total_removed = 0
    files_modified = 0
    
    for file_path in java_files:
        modified, count = remove_unused_imports(file_path)
        if modified:
            files_modified += 1
            total_removed += count
            print(f"Removed {count} unused imports from {file_path}")
    
    print(f"\nSummary:")
    print(f"Files modified: {files_modified}")
    print(f"Total unused imports removed: {total_removed}")

if __name__ == "__main__":
    main()
