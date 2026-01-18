import os
import re

def fix_reducers(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file == 'reducer.js':
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                # Only process if we added our robust pattern earlier
                if 'Array.isArray(payload' in content or 'Object.assign([], payload)' in content:
                    print(f"Processing {path}")
                    
                    # Inject helper if not present
                    if 'const getArray =' not in content:
                        helper = """
  // Helper to ensure we get an array and preserve count for pagination
  const getArray = val => {
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.data)) {
      const arr = val.data;
      if (val.count !== undefined) {
        arr.count = val.count;
      }
      return arr;
    }
    return [];
  };
"""
                        # Insert after the reducer definition
                        content = re.sub(r'((const|let)\s+[A-Za-z0-9]+Reducer\s*=\s*\(state\s*=\s*initState,\s*action\)\s*=>\s*{)', r'\1' + helper, content)

                    # Replace various patterns with getArray(payload)
                    # 1. Previously added robust pattern: (Array.isArray(payload) ? payload : (payload?.data || []))
                    content = re.sub(r'\(Array\.isArray\(payload\)\s*\?\s*payload\s*:\s*\(payload\?\.data\s*\|\|\s*\[\]\)\)', r'getArray(payload)', content)
                    # 2. Variant: (Array.isArray(payload.data) ? payload.data : payload || [])
                    content = re.sub(r'\(Array\.isArray\(payload\.data\)\s*\?\s*payload\.data\s*:\s*payload\s*\|\|\s*\[\]\)', r'getArray(payload)', content)
                    # 3. Simple Object.assign: Object.assign([], payload)
                    content = re.sub(r'Object\.assign\(\[\]\s*,\s*payload\)', r'getArray(payload)', content)
                    # 4. Simple Object.assign with data: Object.assign([], payload.data)
                    content = re.sub(r'Object\.assign\(\[\]\s*,\s*payload\.data\)', r'getArray(payload)', content)
                    
                    print(f"Fixed {path}")
                    with open(path, 'w') as f:
                        f.write(content)

if __name__ == "__main__":
    fix_reducers('/Users/zecs/workspaces/SimpleAccounts-UAE/apps/frontend/src/screens')
