import { createHash } from 'crypto'

/**
 * Generate SHA256 hash in hexadecimal format
 * Used for data integrity verification and secure hashing
 */
export function sha256Hex(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex')
}

/**
 * Generate a secure hash for user data with salt
 * Useful for creating consistent but secure identifiers
 */
export function hashWithSalt(data: string, salt: string = 'moneyxprt-salt'): string {
  return sha256Hex(`${salt}:${data}`)
}

/**
 * Generate a short hash for display purposes (first 8 characters)
 * Good for conversation IDs or reference numbers
 */
export function shortHash(data: string): string {
  return sha256Hex(data).substring(0, 8)
}

/**
 * Verify data integrity by comparing hashes
 */
export function verifyHash(data: string, expectedHash: string): boolean {
  return sha256Hex(data) === expectedHash
}

/**
 * Generate a secure session token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}