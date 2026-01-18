import os
import re

def fix_actions(directory):
    pattern = re.compile(r'payload:\s*{\s*data:\s*(res\.data|Object\.assign\(\[\]\s*,\s*res\.data\))\s*,?\s*}', re.DOTALL)
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == 'actions.js':
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                new_content = pattern.sub(r'payload: res.data', content)
                
                if content != new_content:
                    print(f"Fixed {path}")
                    with open(path, 'w') as f:
                        f.write(new_content)

if __name__ == "__main__":
    fix_actions('/Users/zecs/workspaces/SimpleAccounts-UAE/apps/frontend/src/screens')
