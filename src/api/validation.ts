/**
 * QPay Server-Side Validation Layer
 * Phase 2 — Backend API Layer
 * 
 * Rules:
 * - Client-side validation is UX-only.
 * - Server validates all payloads, ranges, regexes, and state transitions.
 */

export class ValidationError extends Error {
  public fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export class Validator {
  /**
   * Validates positive monetary amount in SAR
   */
  static validateAmount(amount: any, fieldName: string = 'amount', maxAmount: number = 1000000): number {
    const num = Number(amount);
    if (isNaN(num) || !isFinite(num)) {
      throw new ValidationError(`${fieldName} must be a valid number.`, { [fieldName]: 'Invalid number format' });
    }
    if (num <= 0) {
      throw new ValidationError(`${fieldName} must be greater than 0.00 SAR.`, { [fieldName]: 'Must be greater than zero' });
    }
    if (num > maxAmount) {
      throw new ValidationError(`${fieldName} cannot exceed SAR ${maxAmount.toLocaleString()}.`, { [fieldName]: 'Exceeds maximum limit' });
    }
    // Round to 2 decimal places to avoid floating point imprecision
    return Math.round(num * 100) / 100;
  }

  /**
   * Validates Saudi National ID (10 digits, starts with 1 for citizen, 2 for Iqama)
   */
  static validateSaudiNationalId(id: string): string {
    const cleanId = String(id || '').replace(/\D/g, '');
    if (!/^[12]\d{9}$/.test(cleanId)) {
      throw new ValidationError(
        'National ID must be exactly 10 digits starting with 1 (Citizen) or 2 (Iqama).',
        { nationalId: 'Invalid Saudi National ID format' }
      );
    }
    return cleanId;
  }

  /**
   * Validates Saudi IBAN format (SA + 22 alphanumeric characters = 24 chars)
   */
  static validateSaudiIban(iban: string): string {
    const cleanIban = String(iban || '').replace(/\s+/g, '').toUpperCase();
    if (!/^SA\d{2}[A-Z0-9]{20}$/.test(cleanIban)) {
      throw new ValidationError(
        'Saudi IBAN must be exactly 24 characters starting with SA followed by valid digits.',
        { iban: 'Invalid Saudi IBAN structure' }
      );
    }
    return cleanIban;
  }

  /**
   * Validates Saudi mobile phone number (+966 5X XXX XXXX or 05XXXXXXXX)
   */
  static validateSaudiMobile(mobile: string): string {
    const clean = String(mobile || '').replace(/\D/g, '');
    if (clean.startsWith('9665') && clean.length === 12) {
      return `+${clean}`;
    }
    if (clean.startsWith('05') && clean.length === 10) {
      return `+966${clean.substring(1)}`;
    }
    if (clean.startsWith('5') && clean.length === 9) {
      return `+966${clean}`;
    }
    throw new ValidationError('Mobile number must be a valid Saudi number (e.g. 05XXXXXXXX).', {
      mobile: 'Invalid Saudi mobile prefix or length',
    });
  }

  /**
   * Validates non-empty string with length bounds
   */
  static validateString(str: any, fieldName: string, minLen = 1, maxLen = 255): string {
    if (typeof str !== 'string' || str.trim().length < minLen || str.trim().length > maxLen) {
      throw new ValidationError(
        `${fieldName} must be between ${minLen} and ${maxLen} characters.`,
        { [fieldName]: `Invalid length (${minLen}-${maxLen})` }
      );
    }
    return str.trim();
  }

  /**
   * Validates state transition according to allowed finite state machine
   */
  static validateStateTransition<T extends string>(
    currentState: T,
    nextState: T,
    allowedTransitions: Record<T, T[]>,
    entityName = 'Entity'
  ): void {
    const allowed = allowedTransitions[currentState] || [];
    if (!allowed.includes(nextState)) {
      throw new ValidationError(
        `Invalid state transition for ${entityName}: Cannot transition from '${currentState}' to '${nextState}'.`,
        { state: `Illegal transition from ${currentState} to ${nextState}` }
      );
    }
  }
}
