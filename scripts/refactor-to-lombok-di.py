#!/usr/bin/env python3
"""
Refactor Spring Field Injection to Lombok @RequiredArgsConstructor.
Fixes java:S6813.

Target: Classes with @RestController, @Service, @Repository, @Component
Action:
1. Add @RequiredArgsConstructor
2. Change @Autowired private Field field; -> private final Field field;
"""

import re
import os

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if it's a Spring Bean
    if not re.search(r'@(RestController|Service|Repository|Component)', content):
        return False

    # Check if it has @Autowired fields
    if not re.search(r'@Autowired\s+private\s+', content):
        return False

    # Skip if already has RequiredArgsConstructor or NoArgsConstructor (manual check needed then)
    if '@RequiredArgsConstructor' in content or '@NoArgsConstructor' in content or '@AllArgsConstructor' in content:
        return False

    # Skip if it has a manual constructor (simple check: public ClassName() or public ClassName(args))
    class_name_match = re.search(r'public\s+class\s+(\w+)', content)
    if not class_name_match:
        return False
    class_name = class_name_match.group(1)
    
    # Regex for constructor: public ClassName(
    if re.search(r'public\s+' + class_name + r'\s*\(', content):
        return False

    new_content = content
    
    # 1. Add @RequiredArgsConstructor to class
    # Find class declaration
    class_decl_pattern = r'(public\s+(?:abstract\s+)?class\s+' + class_name + r')'
    new_content = re.sub(class_decl_pattern, r'@RequiredArgsConstructor\n\1', new_content)

    # 2. Add import lombok.RequiredArgsConstructor;
    if 'import lombok.RequiredArgsConstructor;' not in new_content:
        # Insert after package or last import
        if 'import lombok' in new_content:
             new_content = re.sub(r'(import lombok\.[^;]+;)', r'\1\nimport lombok.RequiredArgsConstructor;', new_content, count=1)
        else:
             # Fallback: find any import
             new_content = re.sub(r'(import [^;]+;)', r'\1\nimport lombok.RequiredArgsConstructor;', new_content, count=1)

    # 3. Refactor fields
    # Match: @Autowired [newlines/spaces] private Type field;
    # Replace with: private final Type field;
    
    # Regex needs to handle potential qualifiers or other annotations?
    # Simple case: @Autowired private Type name;
    
    def replacer(match):
        # match.group(0) is the whole block
        # We want to keep indentation
        # Pattern: (@Autowired\s+)(private\s+)([\w<>?,
    #        ]+)(\s+\w+\s*;)
        
        # Simpler: Replace "@Autowired\s+private" with "private final"
        # But we need to make sure we don't double up if it's already final (unlikely with Autowired)
        return "private final"

    # Pattern for @Autowired followed by private
    # We replace the whole "@Autowired...private" sequence with "private final"
    new_content = re.sub(r'@Autowired\s+private', 'private final', new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    
    return False

def main():
    root_dir = 'apps/backend/src/main/java'
    count = 0
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.java'):
                if process_file(os.path.join(root, file)):
                    print(f"Refactored: {file}")
                    count += 1
    print(f"Total files refactored: {count}")

if __name__ == "__main__":
    main()
