// Utility Functions
// Simplified implementation to avoid dependency issues

import { currencyService } from '../services/currency.service';

// Format currency
export const formatCurrency = (amount: number, currency?: string): string => {
  // Use provided currency or get from service
  const currencyCode = currency || currencyService.getCurrentCurrency();
  return currencyService.formatAmount(amount, currencyCode);
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date and time
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Capitalize first letter
export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Truncate text
export const truncateText = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate random ID
export const generateId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Format number
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format percentage
export const formatPercentage = (num: number): string => {
  return `${num.toFixed(2)}%`;
};

// Format phone number
export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

// Format email
export const formatEmail = (email: string): string => {
  return email.toLowerCase();
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  capitalizeFirstLetter,
  truncateText,
  generateId,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  formatEmail,
};