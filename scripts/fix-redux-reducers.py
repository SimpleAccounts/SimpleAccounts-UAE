import os
import re

def fix_reducers(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == 'reducer.js':
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                modified = False
                
                # Helper code with shallow copy for immutability
                helper_code = """
  // Helper to ensure we get an array and preserve count for pagination
  const getArray = val => {
    if (Array.isArray(val)) return [...val];
    if (Array.isArray(val?.data)) {
      const arr = [...val.data];
      if (val.count !== undefined) {
        arr.count = val.count;
      }
      return arr;
    }
    return [];
  };
"""

                # 1. Update or Inject helper
                if 'const getArray =' in content:
                    # Update existing helper to use shallow copy
                    new_content = re.sub(
                        r'const getArray = val => \{.*?\};',
                        'const getArray = val => {' + 
                        '\n    if (Array.isArray(val)) return [...val];' +
                        '\n    if (Array.isArray(val?.data)) {' +
                        '\n      const arr = [...val.data];' +
                        '\n      if (val.count !== undefined) {' +
                        '\n        arr.count = val.count;' +
                        '\n      }' +
                        '\n      return arr;' +
                        '\n    }' +
                        '\n    return [];' +
                        '\n  };',
                        content,
                        flags=re.DOTALL
                    )
                    if new_content != content:
                        content = new_content
                        modified = True
                else:
                    # Inject helper if we find patterns that should use it
                    if any(p in content for p in ['Array.isArray(payload', 'Object.assign([], payload)', 'payload?.data']):
                        content = re.sub(r'((const|let)\s+[A-Za-z0-9]+Reducer\s*=\s*\(state\s*=\s*initState,\s*action\)\s*=>\s*{)', r'\1' + helper_code, content)
                        modified = True

                # 2. Replace various patterns with getArray(payload)
                # Previously added robust pattern: (Array.isArray(payload) ? payload : (payload?.data || []))
                new_content = re.sub(r'\(Array\.isArray\(payload\)\s*\?\s*payload\s*:\s*\(payload\?\.data\s*\|\|\s*\[\]\)\)', r'getArray(payload)', content)
                # Variant: (Array.isArray(payload.data) ? payload.data : payload || [])
                new_content = re.sub(r'\(Array\.isArray\(payload\.data\)\s*\?\s*payload\.data\s*:\s*payload\s*\|\|\s*\[\]\)', r'getArray(payload)', new_content)
                # Simple Object.assign: Object.assign([], payload)
                new_content = re.sub(r'Object\.assign\(\[\]\s*,\s*payload\)', r'getArray(payload)', new_content)
                # Simple Object.assign with data: Object.assign([], payload.data)
                new_content = re.sub(r'Object\.assign\(\[\]\s*,\s*payload\.data\)', r'getArray(payload)', new_content)
                # Raw array access from payload.data
                new_content = re.sub(r'vat_transaction_list:\s*Array\.isArray\(payload\.data\)\s*\?\s*payload\.data\s*:\s*payload\s*\|\|\s*\[\]', r'vat_transaction_list: getArray(payload)', new_content)
                
                if new_content != content:
                    content = new_content
                    modified = True
                
                if modified:
                    print(f"Fixed {path}")
                    with open(path, 'w') as f:
                        f.write(content)

if __name__ == "__main__":
    fix_reducers('/Users/zecs/workspaces/SimpleAccounts-UAE/apps/frontend/src/screens')
