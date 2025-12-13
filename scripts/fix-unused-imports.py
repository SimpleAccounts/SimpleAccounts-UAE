#!/usr/bin/env python3
"""
Script to identify and remove unused imports from Java files.
This helps address SonarQube unused-import issues (for example, java:S1128).
"""

import re
import os
import sys

_IMPORT_LINE_RE = re.compile(r'^\s*import\s+(static\s+)?([^;]+);\s*(?://.*)?$', re.MULTILINE)
_PACKAGE_LINE_RE = re.compile(r'^\s*package\s+[^;]+;\s*$', re.MULTILINE)

def strip_comments_and_literals(content):
    """
    Remove comments and mask string/char literals while preserving newlines.

    This avoids false negatives when scanning for symbol usage (for example, comment markers
    inside strings like "http://..." or quotes inside comments).
    """
    out = []
    i = 0
    state = "NORMAL"

    while i < len(content):
        ch = content[i]
        nxt = content[i + 1] if i + 1 < len(content) else ""

        if state == "NORMAL":
            if ch == '"':
                state = "STRING"
                out.append('"')
                i += 1
                continue
            if ch == "'":
                state = "CHAR"
                out.append("'")
                i += 1
                continue
            if ch == "/" and nxt == "/":
                state = "LINE_COMMENT"
                out.append(" ")
                out.append(" ")
                i += 2
                continue
            if ch == "/" and nxt == "*":
                state = "BLOCK_COMMENT"
                out.append(" ")
                out.append(" ")
                i += 2
                continue

            out.append(ch)
            i += 1
            continue

        if state == "STRING":
            if ch == "\\" and nxt:
                out.append(" ")
                out.append(" ")
                i += 2
                continue
            if ch == '"':
                state = "NORMAL"
                out.append('"')
                i += 1
                continue
            out.append("\n" if ch == "\n" else " ")
            i += 1
            continue

        if state == "CHAR":
            if ch == "\\" and nxt:
                out.append(" ")
                out.append(" ")
                i += 2
                continue
            if ch == "'":
                state = "NORMAL"
                out.append("'")
                i += 1
                continue
            out.append("\n" if ch == "\n" else " ")
            i += 1
            continue

        if state == "LINE_COMMENT":
            if ch == "\n":
                state = "NORMAL"
                out.append("\n")
                i += 1
                continue
            out.append(" ")
            i += 1
            continue

        if state == "BLOCK_COMMENT":
            if ch == "*" and nxt == "/":
                state = "NORMAL"
                out.append(" ")
                out.append(" ")
                i += 2
                continue
            out.append("\n" if ch == "\n" else " ")
            i += 1
            continue

    return "".join(out)

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
    - sorting for deterministic output
    """
    seen = set()
    normalized = []
    for is_static, path in imports:
        key = (is_static, path)
        if key in seen:
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

def is_import_used(is_static, import_path, code_without_imports):
    """Check if an import is actually used in the code."""
    # Wildcards are hard to prove safe to remove; always keep them.
    if import_path.endswith(".*"):
        return True

    imported_symbol = import_path.split(".")[-1]

    # If the symbol is only referenced as part of a fully-qualified name (".Symbol"),
    # the import is still unused. Require the occurrence not be immediately preceded by a dot.
    pattern = r"(?<!\.)\b" + re.escape(imported_symbol) + r"\b"
    return bool(re.search(pattern, code_without_imports))

def remove_unused_imports(file_path):
    """Remove unused imports from a Java file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        lines = content.splitlines(True)

        raw_imports = parse_import_lines(content)
        if not raw_imports:
            return False, 0

        content_without_imports = "".join(
            line for line in lines if not _IMPORT_LINE_RE.match(line)
        )
        code_without_imports = strip_comments_and_literals(content_without_imports)

        kept_imports = set()
        removed_count = 0
        new_lines = []

        for line in lines:
            match = _IMPORT_LINE_RE.match(line)
            if not match:
                new_lines.append(line)
                continue

            is_static = bool(match.group(1))
            path = match.group(2).strip()
            key = (is_static, path)

            if key in kept_imports:
                removed_count += 1
                continue

            if is_import_used(is_static, path, code_without_imports):
                kept_imports.add(key)
                new_lines.append(line)
                continue

            removed_count += 1

        content = "".join(new_lines)
        if content != original_content:
            with open(file_path, "w", encoding="utf-8") as f:
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
