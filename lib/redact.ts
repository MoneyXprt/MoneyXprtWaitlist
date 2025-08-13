/**
 * PII Redaction utilities for financial data privacy and compliance
 * Protects sensitive information in logs and responses
 */

// Common PII patterns for financial data
const PII_PATTERNS = {
  // Social Security Numbers
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
  // Credit Card Numbers (basic pattern)
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  // Phone Numbers
  phone: /\b\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})\b/g,
  // Email Addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Bank Account Numbers (8-17 digits)
  bankAccount: /\b\d{8,17}\b/g,
  // Tax ID / EIN
  ein: /\b\d{2}-?\d{7}\b/g,
  // Routing Numbers
  routing: /\b\d{9}\b/g,
  // Street Addresses (basic pattern)
  address: /\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct)\b/gi,
}

/**
 * Redact PII from text content
 */
export function redactPII(text: string, options: {
  preserveFormat?: boolean
  customPatterns?: Record<string, RegExp>
  redactionChar?: string
} = {}): string {
  const {
    preserveFormat = true,
    customPatterns = {},
    redactionChar = '*'
  } = options

  let redacted = text

  // Apply built-in PII patterns
  Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
    redacted = redacted.replace(pattern, (match) => {
      if (preserveFormat) {
        // Keep first and last character, redact middle
        if (match.length <= 2) return redactionChar.repeat(match.length)
        return match[0] + redactionChar.repeat(Math.max(1, match.length - 2)) + match[match.length - 1]
      }
      return `[${type.toUpperCase()}_REDACTED]`
    })
  })

  // Apply custom patterns
  Object.entries(customPatterns).forEach(([type, pattern]) => {
    redacted = redacted.replace(pattern, `[${type.toUpperCase()}_REDACTED]`)
  })

  return redacted
}

/**
 * Check if text contains potential PII
 */
export function containsPII(text: string): boolean {
  return Object.values(PII_PATTERNS).some(pattern => pattern.test(text))
}

/**
 * Redact financial amounts while preserving approximate ranges
 */
export function redactFinancialAmounts(text: string): string {
  const amountPattern = /\$[\d,]+(?:\.\d{2})?/g
  
  return text.replace(amountPattern, (match) => {
    const amount = parseFloat(match.replace(/[$,]/g, ''))
    
    // Preserve general ranges for context
    if (amount < 1000) return '$[<1K]'
    if (amount < 10000) return '$[1K-10K]'
    if (amount < 100000) return '$[10K-100K]'
    if (amount < 1000000) return '$[100K-1M]'
    return '$[>1M]'
  })
}

/**
 * Redact income information while preserving tax bracket context
 */
export function redactIncomeInfo(text: string): string {
  const incomePatterns = [
    /\$[\d,]+(?:\.\d{2})?\s*(?:per\s+year|annually|\/year|salary|income)/gi,
    /(?:income|salary|earning)\s*:?\s*\$[\d,]+(?:\.\d{2})?/gi,
    /(?:make|making|earn|earning)\s+\$[\d,]+(?:\.\d{2})?/gi
  ]

  let redacted = text
  
  incomePatterns.forEach(pattern => {
    redacted = redacted.replace(pattern, (match) => {
      const amount = parseFloat(match.replace(/[^\d.]/g, ''))
      
      // Preserve tax bracket ranges for financial context
      if (amount < 50000) return match.replace(/\$[\d,]+(?:\.\d{2})?/, '$[<50K]')
      if (amount < 100000) return match.replace(/\$[\d,]+(?:\.\d{2})?/, '$[50K-100K]')
      if (amount < 200000) return match.replace(/\$[\d,]+(?:\.\d{2})?/, '$[100K-200K]')
      if (amount < 500000) return match.replace(/\$[\d,]+(?:\.\d{2})?/, '$[200K-500K]')
      return match.replace(/\$[\d,]+(?:\.\d{2})?/, '$[>500K]')
    })
  })
  
  return redacted
}

/**
 * Safe logging function that automatically redacts PII
 */
export function safeLog(level: 'info' | 'warn' | 'error', message: string, data?: any) {
  const redactedMessage = redactPII(message)
  const redactedData = data ? redactPII(JSON.stringify(data)) : undefined
  
  console[level](`[SAFE_LOG] ${redactedMessage}`, redactedData ? JSON.parse(redactedData) : '')
}

/**
 * Create a sanitized version of user input for AI processing
 */
export function sanitizeForAI(input: string): {
  sanitized: string
  hasPII: boolean
  redactionCount: number
} {
  const original = input
  const sanitized = redactPII(redactFinancialAmounts(redactIncomeInfo(input)))
  const hasPII = containsPII(original)
  const redactionCount = (original.match(/\*/g) || []).length - (sanitized.match(/\*/g) || []).length
  
  return {
    sanitized,
    hasPII,
    redactionCount: Math.abs(redactionCount)
  }
}