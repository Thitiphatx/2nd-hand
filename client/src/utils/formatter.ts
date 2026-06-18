export const formatTHB = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(amount);
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

export const getPaymentMethodInfo = (method: string): { label: string; color: string } => {
  switch (method) {
    case 'CREDIT_CARD':
      return { label: 'Credit Card', color: 'orange' };
    case 'PROMPTPAY':
      return { label: 'PromptPay', color: 'blue' };
    default:
      return { label: method, color: 'default' };
  }
};
