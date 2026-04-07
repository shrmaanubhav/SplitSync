// ---------- CURRENCY ----------

export const formatCurrency = (
  amount: number,
  currency: string = 'INR'
): string => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
};

// ---------- DATE ----------

export const formatDate = (dateString: string | number): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string | number): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ---------- STRING ----------

export const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ---------- ID ----------

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

// ---------- NUMBER ----------

export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-IN');
};

export const formatPercentage = (num: number): string => {
  return `${num.toFixed(2)}%`;
};

// ---------- PHONE ----------

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/(\d{5})(\d{5})/, '$1 $2'); 
};

// ---------- EMAIL ----------

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