/**
 * Client-side encryption service for journal entries
 * Uses Web Crypto API to encrypt/decrypt journal content
 * 
 * The encryption key is derived from the user's ID and stored in localStorage
 * This ensures only the user can decrypt their own entries
 */

const KEY_STORAGE_PREFIX = 'ember_encryption_key_';
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

/**
 * Get or generate encryption key for a user
 */
async function getEncryptionKey(userId: string): Promise<CryptoKey> {
  const storageKey = `${KEY_STORAGE_PREFIX}${userId}`;
  
  // Try to get existing key from localStorage
  const storedKeyData = localStorage.getItem(storageKey);
  
  if (storedKeyData) {
    try {
      // Import the existing key
      const keyData = JSON.parse(storedKeyData);
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        {
          name: ALGORITHM,
          length: KEY_LENGTH,
        },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to import existing key, generating new one:', error);
      // If import fails, generate a new key
    }
  }
  
  // Generate a new key
  const key = await crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
  
  // Export and store the key
  const exportedKey = await crypto.subtle.exportKey('jwk', key);
  localStorage.setItem(storageKey, JSON.stringify(exportedKey));
  
  return key;
}

/**
 * Generate a random IV (Initialization Vector)
 */
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Encrypt text data
 */
export async function encryptText(text: string, userId: string): Promise<string> {
  try {
    const key = await getEncryptionKey(userId);
    const iv = generateIV();
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      data
    );
    
    // Combine IV and encrypted data, then encode as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64 for storage
    const base64 = btoa(String.fromCharCode(...combined));
    return base64;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text data
 */
export async function decryptText(encryptedData: string, userId: string): Promise<string> {
  try {
    const key = await getEncryptionKey(userId);
    
    // Try to decode from base64 - if it fails, the data is likely not encrypted
    let combined: Uint8Array;
    try {
      combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    } catch (e) {
      throw new Error('Invalid base64 format - data may not be encrypted');
    }
    
    // Check if data is long enough to contain IV + encrypted data
    if (combined.length < IV_LENGTH) {
      throw new Error('Data too short to be encrypted');
    }
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      if (error.message.includes('Invalid base64') || error.message.includes('too short')) {
        throw error; // These indicate the data is likely not encrypted
      }
    }
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data. The data may be corrupted or encrypted with a different key.');
  }
}

/**
 * Clear encryption key for a user (e.g., on logout)
 */
export function clearEncryptionKey(userId: string): void {
  const storageKey = `${KEY_STORAGE_PREFIX}${userId}`;
  localStorage.removeItem(storageKey);
}

/**
 * Check if encryption is supported
 */
export function isEncryptionSupported(): boolean {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.subtle.generateKey === 'function';
}

