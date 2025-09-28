import { gzip, gunzip } from 'fflate';

/**
 * Compresses a string using gzip compression.
 *
 * This function compresses the input string using the gzip algorithm with
 * compression level 6 (balanced speed/compression ratio). The compressed
 * data is returned as a Uint8Array for efficient storage and transmission.
 *
 * @param data The string data to compress
 * @returns Promise resolving to a Uint8Array containing the compressed data
 * @throws {Error} If compression fails or the fflate library encounters an error
 *
 * @example
 * ```typescript
 * const compressed = await compress('Hello, World! This is a long string to compress.');
 * console.log(compressed.length); // Smaller than original string length
 * ```
 */
export function compress(data: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    gzip(new TextEncoder().encode(data), { level: 6 }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/**
 * Decompresses gzip-compressed data back to a string.
 *
 * This function decompresses data that was previously compressed using the
 * {@link compress} function. It expects the input to be a Uint8Array containing
 * valid gzip-compressed data.
 *
 * @param data The compressed data as a Uint8Array (from {@link compress})
 * @returns Promise resolving to the original uncompressed string
 * @throws {Error} If decompression fails, data is corrupted, or not valid gzip format
 *
 * @example
 * ```typescript
 * const compressed = await compress('Hello, World!');
 * const original = await decompress(compressed);
 * console.log(original); // 'Hello, World!'
 * ```
 */
export function decompress(data: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    gunzip(data, (err, result) => {
      if (err) reject(err);
      else resolve(new TextDecoder().decode(result));
    });
  });
}