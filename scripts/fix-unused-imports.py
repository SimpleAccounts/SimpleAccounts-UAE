#!/usr/bin/env python3
"""
Script to identify and remove unused imports from Java files.
This helps fix java:S6813 SonarQube issues.
"""

import re
import os
import sys

_BLOCK_COMMENT_RE = re.compile(r"/\*[\s\S]*?\*/", re.MULTILINE)
_LINE_COMMENT_RE = re.compile(r"//.*?$", re.MULTILINE)
_STRING_RE = re.compile(r"\"(?:\\\\.|[^\"\\\\])*\"")
_CHAR_RE = re.compile(r"'(?:\\\\.|[^'\\\\])'")
_IMPORT_LINE_RE = re.compile(r'^\s*import\s+(static\s+)?([^;]+);\s*(?://.*)?$', re.MULTILINE)
_PACKAGE_LINE_RE = re.compile(r'^\s*package\s+[^;]+;\s*$', re.MULTILINE)

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

def parse_import_lines(content):
    """Parse import lines into (is_static, path) tuples, including duplicates."""
    imports = []
    for match in _IMPORT_LINE_RE.finditer(content):
        is_static = bool(match.group(1))
        path = match.group(2).strip()
        imports.append((is_static, path))
    return imports

def normalize_imports(imports):
    """
    Normalize imports by:
    - removing exact duplicates
    - removing explicit imports covered by a wildcard import from the same package
    - sorting for deterministic output
    """
    wildcard_pkgs = set()
    wildcard_static_pkgs = set()

    for is_static, path in imports:
        if path.endswith('.*'):
            base = path[:-2]
            if is_static:
                wildcard_static_pkgs.add(base)
            else:
                wildcard_pkgs.add(base)

    seen = set()
    normalized = []
    for is_static, path in imports:
        key = (is_static, path)
        if key in seen:
            continue

        # Drop explicit imports that are redundant due to a wildcard import.
        if not path.endswith('.*'):
            pkg = '.'.join(path.split('.')[:-1])
            if is_static and pkg in wildcard_static_pkgs:
                continue
            if not is_static and pkg in wildcard_pkgs:
                continue

        seen.add(key)
        normalized.append(key)

    # Non-static imports first, then static; sort within each group.
    normalized.sort(key=lambda t: (1 if t[0] else 0, t[1]))
    return normalized

def rebuild_import_block(content, imports):
    """Rebuild the import block right after the package declaration."""
    # Remove all existing import lines.
    content_wo_imports = _IMPORT_LINE_RE.sub('', content)
    lines = content_wo_imports.splitlines(True)

    insert_at = 0
    for i, line in enumerate(lines):
        if _PACKAGE_LINE_RE.match(line):
            insert_at = i + 1
            break

    # Remove blank lines immediately following the package statement (we'll re-add cleanly).
    while insert_at < len(lines) and lines[insert_at].strip() == '':
        del lines[insert_at]

    import_lines = []
    if imports:
        import_lines.append('\n')
        for is_static, path in imports:
            if is_static:
                import_lines.append(f'import static {path};\n')
            else:
                import_lines.append(f'import {path};\n')
        import_lines.append('\n')

    lines[insert_at:insert_at] = import_lines
    rebuilt = ''.join(lines)
    rebuilt = re.sub(r'\n\n\n+', '\n\n', rebuilt)
    return rebuilt

def extract_package(content):
    """Extract package name."""
    match = re.search(r'^package\s+([^;]+);', content, re.MULTILINE)
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
    content_without_imports = re.sub(r'^\s*import\s+.*?;\s*(?://.*)?$', '', content, flags=re.MULTILINE)

    # Remove comments and string/char literals to avoid false positives
    # (SonarQube doesn't consider mentions in comments/strings as usage)
    content_without_imports = _BLOCK_COMMENT_RE.sub('', content_without_imports)
    content_without_imports = _LINE_COMMENT_RE.sub('', content_without_imports)
    content_without_imports = _STRING_RE.sub('""', content_without_imports)
    content_without_imports = _CHAR_RE.sub("''", content_without_imports)
    
    # Check for class name usage
    # Make sure it's not part of a package name or another import
    # If the symbol is only referenced as part of a fully-qualified name (".ClassName"),
    # the import is still unused. So we require the occurrence not be immediately
    # preceded by a dot.
    pattern = r'(?<!\.)\b' + re.escape(class_name) + r'\b'
    
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
        raw_imports = parse_import_lines(content)
        
        if not raw_imports:
            return False, 0
        
        normalized_imports = normalize_imports(raw_imports)
        # Apply normalization (dedupe/redundant) first, then detect true unused.
        content = rebuild_import_block(content, normalized_imports)
        
        remaining_imports = []
        for is_static, path in normalized_imports:
            # Keep wildcard imports (usage is hard to prove safely).
            if path.endswith('.*'):
                remaining_imports.append((is_static, path))
                continue
            stmt = f"static {path}" if is_static else path
            if is_import_used(stmt, content, package_name):
                remaining_imports.append((is_static, path))
        
        content = rebuild_import_block(content, remaining_imports)
        
        removed_count = len(raw_imports) - len(remaining_imports)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, max(0, removed_count)
        
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
