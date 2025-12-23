import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32

// Get encryption key from environment variable
function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET
  if (!secret) {
    throw new Error('ENCRYPTION_SECRET environment variable is not set')
  }
  // Derive a 32-byte key from the secret using SHA-256
  return createHash('sha256').update(secret).digest()
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * Returns a string in format: iv:authTag:encryptedData (all base64)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)

  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = cipher.getAuthTag()

  // Combine iv:authTag:encrypted as base64
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
}

/**
 * Decrypt data that was encrypted with encrypt()
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey()

  const parts = encryptedData.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }

  const [ivBase64, authTagBase64, encrypted] = parts
  const iv = Buffer.from(ivBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'base64', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Generate a cryptographically secure random state for OAuth
 * Includes user ID and timestamp, signed to prevent tampering
 */
export function generateOAuthState(userId: string): string {
  const timestamp = Date.now()
  const nonce = randomBytes(16).toString('hex')

  const payload = JSON.stringify({
    userId,
    timestamp,
    nonce,
  })

  // Encrypt the entire payload
  return encrypt(payload)
}

/**
 * Verify and decode OAuth state
 * Returns null if invalid or expired (15 minute expiry)
 */
export function verifyOAuthState(state: string): { userId: string; timestamp: number } | null {
  try {
    const decrypted = decrypt(state)
    const payload = JSON.parse(decrypted)

    // Validate structure
    if (!payload.userId || !payload.timestamp || !payload.nonce) {
      return null
    }

    // Check expiry (15 minutes)
    const MAX_AGE = 15 * 60 * 1000
    if (Date.now() - payload.timestamp > MAX_AGE) {
      return null
    }

    return {
      userId: payload.userId,
      timestamp: payload.timestamp,
    }
  } catch {
    return null
  }
}

/**
 * Hash sensitive identifiers (like Telegram chat IDs) for logging
 * Never log the actual value
 */
export function hashForLogging(value: string): string {
  return createHash('sha256').update(value).digest('hex').substring(0, 12)
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}
