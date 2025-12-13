#!/usr/bin/env python3
"""
Automated script to remove commented-out sections of code from Java files.
This helps fix java:S125 SonarQube issues.

Usage:
  - python3 scripts/remove-commented-code.py
  - python3 scripts/remove-commented-code.py --files-list /path/to/files.txt
  - python3 scripts/remove-commented-code.py path/to/File.java [more files...]
"""

import re
import os
import sys
from pathlib import Path

COMMENT_LINE_RE = re.compile(r"^(?P<indent>\s*)//(?P<body>.*)$")
CODE_HINT_RE = re.compile(r"[;{}=]")


def is_commented_code_block(lines):
    """Heuristic: only remove blocks that look like commented-out code, not prose."""
    for line in lines:
        m = COMMENT_LINE_RE.match(line)
        if not m:
            continue
        body = m.group("body").strip()
        if CODE_HINT_RE.search(body):
            return True
        if re.match(r"^(if|for|while|switch|try|catch|return|throw)\b", body):
            return True
    return False


def remove_commented_code_block(file_path):
    """Remove blocks of commented-out code (2+ consecutive // lines) that look like code."""
    try:
        path = Path(file_path)
        original_lines = path.read_text(encoding="utf-8").splitlines(True)

        new_lines = []
        removed_lines = 0

        i = 0
        while i < len(original_lines):
            if COMMENT_LINE_RE.match(original_lines[i]):
                j = i
                block = []
                while j < len(original_lines) and COMMENT_LINE_RE.match(original_lines[j]):
                    block.append(original_lines[j])
                    j += 1

                if is_commented_code_block(block):
                    removed_lines += len(block)
                    if new_lines and not new_lines[-1].endswith("\n"):
                        new_lines.append("\n")
                    if new_lines and new_lines[-1].strip() != "":
                        new_lines.append("\n")
                    i = j
                    continue

            new_lines.append(original_lines[i])
            i += 1

        # Clean up any excessive blank lines that might be introduced
        new_content = "".join(new_lines)
        new_content = re.sub(r"\n\n\n+", "\n\n", new_content)

        if new_content != "".join(original_lines):
            path.write_text(new_content, encoding="utf-8")
            return True, removed_lines

        return False, 0

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False, 0

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--files-list":
        if len(sys.argv) < 3:
            print("Usage: python3 scripts/remove-commented-code.py --files-list /path/to/files.txt")
            sys.exit(1)
        files = [line.strip() for line in Path(sys.argv[2]).read_text(encoding="utf-8").splitlines() if line.strip()]
    elif len(sys.argv) > 1:
        files = sys.argv[1:]
    else:
        root_dir = "apps/backend/src/main/java"
        files = []
        for root, _, filenames in os.walk(root_dir):
            # Exclude test directories (for S125, it usually applies to main code)
            if "test" in root or "target" in root:
                continue
            for filename in filenames:
                if filename.endswith(".java"):
                    files.append(os.path.join(root, filename))

    total_removed_lines = 0
    files_modified = 0
    
    for file_path in files:
        modified, removed_lines = remove_commented_code_block(file_path)
        if modified:
            files_modified += 1
            total_removed_lines += removed_lines
            print(f"Removed {removed_lines} lines of commented code from {file_path}")
    
    print(f"\nSummary: Modified {files_modified} files, removed {total_removed_lines} lines of commented code (java:S125)")

if __name__ == "__main__":
    main()
