export const formatCurrency = (value: number, showSign = false): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  
  if (showSign && value !== 0) {
    return value > 0 ? `+${formatted}` : `-${formatted.replace('₹', '₹')}`;
  }
  
  return value < 0 ? `-${formatted}` : formatted;
};

export const formatPercent = (value: number, showSign = false): string => {
  const formatted = `${Math.abs(value).toFixed(2)}%`;
  
  if (showSign && value !== 0) {
    return value > 0 ? `+${formatted}` : `-${formatted}`;
  }
  
  return value < 0 ? `-${formatted}` : formatted;
};

export const formatRatio = (value: number): string => {
  if (!isFinite(value)) return '∞';
  return value.toFixed(2);
};

export const formatDays = (value: number): string => {
  return `${value} ${value === 1 ? 'day' : 'days'}`;
};

export const formatStreak = (value: number): string => {
  if (value === 0) return '0';
  return value > 0 ? `+${value}` : `${value}`;
};