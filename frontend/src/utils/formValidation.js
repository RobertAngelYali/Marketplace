export const onlyDigits = (value, maxLength) => {
  const digits = String(value || '').replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
};

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export const isValidUrl = (value) => {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const hasPasswordStrength = (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(String(value || ''));

export const fieldClass = (hasError = false) =>
  `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`;


export const scrollToFirstError = () => {
  setTimeout(() => {
    const element = document.querySelector('[data-error="true"]');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 50);
};
