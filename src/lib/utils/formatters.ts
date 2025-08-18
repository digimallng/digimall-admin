// Currency formatting
export function formatCurrency(
  amount: number, 
  currency = 'NGN',
  locale = 'en-NG'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency} ${amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

// Number formatting
export function formatNumber(
  num: number,
  options: {
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  } = {}
): string {
  const {
    notation = 'standard',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    locale = 'en-US'
  } = options;

  return new Intl.NumberFormat(locale, {
    notation,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(num);
}

// Compact number formatting (1K, 1M, etc.)
export function formatCompactNumber(num: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

// Percentage formatting
export function formatPercentage(
  value: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
  } = {}
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 1,
    locale = 'en-US'
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100);
}

// Date formatting
export function formatDate(
  date: string | Date,
  options: {
    format?: 'short' | 'medium' | 'long' | 'full' | 'relative' | 'time';
    locale?: string;
    timeZone?: string;
  } = {}
): string {
  const { format = 'medium', locale = 'en-US', timeZone = 'UTC' } = options;
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    return formatRelativeTime(dateObj, locale);
  }

  if (format === 'time') {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone,
    }).format(dateObj);
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone,
  };

  switch (format) {
    case 'short':
      formatOptions.dateStyle = 'short';
      break;
    case 'medium':
      formatOptions.dateStyle = 'medium';
      formatOptions.timeStyle = 'short';
      break;
    case 'long':
      formatOptions.dateStyle = 'long';
      formatOptions.timeStyle = 'medium';
      break;
    case 'full':
      formatOptions.dateStyle = 'full';
      formatOptions.timeStyle = 'full';
      break;
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

// Relative time formatting (2 hours ago, in 3 days, etc.)
export function formatRelativeTime(
  date: Date,
  locale = 'en-US',
  baseDate = new Date()
): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffInSeconds = (date.getTime() - baseDate.getTime()) / 1000;

  const intervals = [
    { unit: 'year' as const, seconds: 31536000 },
    { unit: 'month' as const, seconds: 2592000 },
    { unit: 'day' as const, seconds: 86400 },
    { unit: 'hour' as const, seconds: 3600 },
    { unit: 'minute' as const, seconds: 60 },
    { unit: 'second' as const, seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit);
    }
  }

  return rtf.format(0, 'second');
}

// Duration formatting (for uptime, processing time, etc.)
export function formatDuration(
  seconds: number,
  options: {
    format?: 'long' | 'short' | 'compact';
    maxUnits?: number;
  } = {}
): string {
  const { format = 'short', maxUnits = 2 } = options;

  const units = [
    { name: 'year', short: 'y', seconds: 31536000 },
    { name: 'month', short: 'mo', seconds: 2592000 },
    { name: 'day', short: 'd', seconds: 86400 },
    { name: 'hour', short: 'h', seconds: 3600 },
    { name: 'minute', short: 'm', seconds: 60 },
    { name: 'second', short: 's', seconds: 1 },
  ];

  const parts: string[] = [];
  let remainingSeconds = Math.abs(seconds);

  for (const unit of units) {
    if (parts.length >= maxUnits) break;
    
    const count = Math.floor(remainingSeconds / unit.seconds);
    if (count > 0) {
      remainingSeconds -= count * unit.seconds;
      
      if (format === 'long') {
        parts.push(`${count} ${unit.name}${count !== 1 ? 's' : ''}`);
      } else if (format === 'short') {
        parts.push(`${count}${unit.short}`);
      } else { // compact
        parts.push(`${count}${unit.short}`);
      }
    }
  }

  if (parts.length === 0) {
    return format === 'long' ? '0 seconds' : '0s';
  }

  return format === 'long' ? parts.join(', ') : parts.join(' ');
}

// Bytes formatting
export function formatBytes(
  bytes: number,
  options: {
    decimals?: number;
    binary?: boolean;
    locale?: string;
  } = {}
): string {
  const { decimals = 1, binary = false, locale = 'en-US' } = options;

  if (bytes === 0) return '0 B';

  const base = binary ? 1024 : 1000;
  const units = binary
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const exponent = Math.floor(Math.log(Math.abs(bytes)) / Math.log(base));
  const value = bytes / Math.pow(base, exponent);

  return `${value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })} ${units[exponent]}`;
}

// File size formatting with automatic unit selection
export function formatFileSize(bytes: number): string {
  return formatBytes(bytes, { decimals: 1, binary: true });
}

// Rate formatting (per second, per minute, etc.)
export function formatRate(
  value: number,
  unit: 'second' | 'minute' | 'hour' | 'day',
  options: {
    compact?: boolean;
    decimals?: number;
  } = {}
): string {
  const { compact = false, decimals = 1 } = options;
  const formattedValue = value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });

  const unitMap = {
    second: compact ? '/s' : ' per second',
    minute: compact ? '/min' : ' per minute',
    hour: compact ? '/hr' : ' per hour',
    day: compact ? '/day' : ' per day',
  };

  return `${formattedValue}${unitMap[unit]}`;
}

// Phone number formatting
export function formatPhoneNumber(
  phoneNumber: string,
  countryCode = '+234'
): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle Nigerian phone numbers
  if (countryCode === '+234') {
    if (cleaned.startsWith('234')) {
      const number = cleaned.substring(3);
      return `+234 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    } else if (cleaned.startsWith('0')) {
      const number = cleaned.substring(1);
      return `+234 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    } else if (cleaned.length === 10) {
      return `+234 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }
  }
  
  return phoneNumber; // Return original if can't format
}

// Status formatting with color coding
export function formatStatus(
  status: string,
  type: 'order' | 'payment' | 'user' | 'vendor' | 'product' = 'order'
): { text: string; color: string; bgColor: string } {
  const statusMaps = {
    order: {
      pending: { text: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      confirmed: { text: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      processing: { text: 'Processing', color: 'text-purple-700', bgColor: 'bg-purple-100' },
      shipped: { text: 'Shipped', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
      delivered: { text: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
      cancelled: { text: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
      refunded: { text: 'Refunded', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    },
    payment: {
      pending: { text: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      processing: { text: 'Processing', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      completed: { text: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' },
      failed: { text: 'Failed', color: 'text-red-700', bgColor: 'bg-red-100' },
      cancelled: { text: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    },
    user: {
      active: { text: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' },
      inactive: { text: 'Inactive', color: 'text-gray-700', bgColor: 'bg-gray-100' },
      suspended: { text: 'Suspended', color: 'text-red-700', bgColor: 'bg-red-100' },
      pending: { text: 'Pending Verification', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    },
    vendor: {
      pending: { text: 'Pending Review', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      approved: { text: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100' },
      rejected: { text: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
      suspended: { text: 'Suspended', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    },
    product: {
      draft: { text: 'Draft', color: 'text-gray-700', bgColor: 'bg-gray-100' },
      pending: { text: 'Pending Review', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      approved: { text: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100' },
      rejected: { text: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
      archived: { text: 'Archived', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    },
  };

  const statusMap = statusMaps[type] || statusMaps.order;
  const statusConfig = statusMap[status as keyof typeof statusMap];

  return statusConfig || {
    text: status.charAt(0).toUpperCase() + status.slice(1),
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  };
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Format order ID for display
export function formatOrderId(orderId: string): string {
  // Extract last 8 characters and format as #XXXXXXXX
  return `#${orderId.slice(-8).toUpperCase()}`;
}