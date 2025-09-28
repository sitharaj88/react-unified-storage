/**
 * Creates an AES-GCM encryption key from a password using PBKDF2 key derivation.
 *
 * This function derives a cryptographically secure AES-GCM key from a user-provided
 * password using the PBKDF2 algorithm with SHA-256. The key derivation process
 * includes 100,000 iterations for enhanced security against brute-force attacks.
 *
 * @param password The password to derive the encryption key from
 * @param salt Optional salt for key derivation. If not provided, a random 16-byte salt is generated
 * @returns Promise resolving to a CryptoKey suitable for AES-GCM encryption/decryption
 * @throws {Error} If the Web Crypto API is not available or key derivation fails
 *
 * @example
 * ```typescript
 * const key = await makeAesKey('my-secret-password');
 * const encrypted = await encrypt('sensitive data', key);
 * ```
 */
export async function makeAesKey(password: string, salt?: string): Promise<CryptoKey> {
  const saltBytes = salt ? new TextEncoder().encode(salt) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a string using AES-GCM encryption with the provided key.
 *
 * This function encrypts the input data using AES-GCM mode with a randomly
 * generated initialization vector (IV) for each encryption operation. The IV
 * is prepended to the encrypted data for use during decryption.
 *
 * @param data The string data to encrypt
 * @param key The AES-GCM CryptoKey to use for encryption
 * @returns Promise resolving to base64-encoded encrypted data (IV + ciphertext)
 * @throws {Error} If encryption fails or the Web Crypto API is not available
 *
 * @example
 * ```typescript
 * const key = await makeAesKey('password');
 * const encrypted = await encrypt('Hello, World!', key);
 * console.log(encrypted); // base64 string
 * ```
 */
export async function encrypt(data: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(data)
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts AES-GCM encrypted data using the provided key.
 *
 * This function decrypts data that was previously encrypted with the {@link encrypt}
 * function. It extracts the initialization vector from the beginning of the encrypted
 * data and uses it along with the key to decrypt the ciphertext.
 *
 * @param encryptedData The base64-encoded encrypted data (from {@link encrypt})
 * @param key The AES-GCM CryptoKey to use for decryption (must be the same key used for encryption)
 * @returns Promise resolving to the original decrypted string
 * @throws {Error} If decryption fails, the key is incorrect, or data is corrupted
 *
 * @example
 * ```typescript
 * const key = await makeAesKey('password');
 * const encrypted = await encrypt('Hello, World!', key);
 * const decrypted = await decrypt(encrypted, key);
 * console.log(decrypted); // 'Hello, World!'
 * ```
 */
export async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
  const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}