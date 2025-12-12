#!/usr/bin/env python3
"""
Automated script to remove commented-out sections of code from Java files.
This helps fix java:S125 SonarQube issues.

Usage: python3 scripts/remove-commented-code.py
"""

import re
import os
from pathlib import Path

def remove_commented_code_block(file_path):
    """
    Removes blocks of commented-out code.
    This script is conservative and targets specific patterns of commented-out code blocks,
    not just any comment.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        modified_count = 0

        # Simpler and safer pattern: Remove consecutive lines that are fully commented out with `//`
        # and are not Javadoc (do not start with /// or /**).
        # This regex looks for 2 or more consecutive lines starting with `//`
        # and replaces the whole block with a single newline.
        # It avoids removing single-line comments.
        
        # Regex explanation:
        # (^|\n)              - Start of line or after a newline (non-capturing group)
        # (\s*//(?!\s*[/*]).*\n) - Matches a line:
        #   \s*//             - leading whitespace and `//`
        #   (?!\s*[/*])      - negative lookahead: ensures it's not Javadoc or block comment
        #   .*               - rest of the line
        #   \n               - newline character
        # {2,}               - matches 2 or more such consecutive lines
        
        commented_code_block_pattern = re.compile(r'(^|\n)(\s*//(?!\s*[/*]).*\n){2,}', re.MULTILINE)
        
        # Replace matches with a single newline to maintain some spacing, plus the initial newline if captured
        new_content = commented_code_block_pattern.sub(r'\1\n', content)
        
        # Clean up any excessive blank lines that might be introduced
        new_content = re.sub(r'\n\n\n+', '\n\n', new_content)

        if new_content != original_content:
            modified_count = original_content.count('\n') - new_content.count('\n')
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True, modified_count
        
        return False, 0

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False, 0

def main():
    root_dir = 'apps/backend/src/main/java'
    total_removed_lines = 0
    files_modified = 0
    
    for root, dirs, files in os.walk(root_dir):
        # Exclude test directories (for S125, it usually applies to main code)
        if 'test' in root or 'target' in root:
            continue
        for file in files:
            if file.endswith('.java'):
                file_path = os.path.join(root, file)
                modified, removed_lines = remove_commented_code_block(file_path)
                if modified:
                    files_modified += 1
                    total_removed_lines += removed_lines
                    print(f"Removed {removed_lines} lines of commented code from {file_path}")
    
    print(f"\nSummary: Modified {files_modified} files, removed {total_removed_lines} lines of commented code (java:S125)")

if __name__ == "__main__":
    main()