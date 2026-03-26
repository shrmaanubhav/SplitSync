// Validation Service
// Simplified implementation to avoid dependency issues

// Mock validation service
export const validationService = {
  // Validate email
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password
  validatePassword(password: string): boolean {
    // At least 6 characters
    return password.length >= 6;
  },

  // Validate name
  validateName(name: string): boolean {
    // At least 1 character
    return name.length >= 1;
  },

  // Validate amount
  validateAmount(amount: number): boolean {
    // Positive number
    return amount > 0;
  },

  // Validate splits sum
  validateSplitsSum(total: number, splits: number[]): boolean {
    const sum = splits.reduce((acc, split) => acc + split, 0);
    return Math.abs(sum - total) < 0.01; // Allow for floating point precision
  },
};

export default validationService;
