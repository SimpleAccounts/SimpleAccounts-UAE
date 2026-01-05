// Use native Web Crypto API instead of crypto-js package
// Benefits: No package dependency, better security, smaller bundle size

const salt = '71@5g621#$dssfyuhkdf679.,?';

// Convert string to ArrayBuffer
const stringToBuffer = str => new TextEncoder().encode(str);

// Convert ArrayBuffer to string
const bufferToString = buffer => new TextDecoder().decode(buffer);

// Convert ArrayBuffer to base64
const bufferToBase64 = buffer => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert base64 to ArrayBuffer
const base64ToBuffer = base64 => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Derive encryption key from salt
const getEncryptionKey = async () => {
  const keyMaterial = await crypto.subtle.importKey('raw', stringToBuffer(salt), 'PBKDF2', false, [
    'deriveBits',
    'deriveKey',
  ]);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: stringToBuffer('simpleaccounts'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const encryptService = async (key, value) => {
  try {
    const data = JSON.stringify(value);
    const encryptionKey = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      stringToBuffer(data)
    );

    // Store IV + encrypted data as base64
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    window.localStorage.setItem(key, bufferToBase64(combined.buffer));
  } catch (error) {
    console.error('Encryption error:', error);
    return false;
  }
};

export const decryptService = async key => {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return false;

    const combined = new Uint8Array(base64ToBuffer(stored));
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);

    const encryptionKey = await getEncryptionKey();

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      encryptedData
    );

    return JSON.parse(bufferToString(decryptedData));
  } catch (error) {
    console.error('Decryption error:', error);
    return false;
  }
};
