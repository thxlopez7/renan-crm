// Paraguayan mobile numbers: 0981 123 456 / 981123456 / +595 981 123 456 -> +595981123456
export function normalizePyPhone(input) {
  let digits = String(input || '').replace(/\D/g, '');
  if (digits.startsWith('595')) digits = digits.slice(3);
  digits = digits.replace(/^0+/, '');
  return /^9\d{8}$/.test(digits) ? `+595${digits}` : null;
}

// Display as 0981 123 456, the way people write it locally
export function formatPyPhone(input) {
  const normalized = normalizePyPhone(input);
  if (!normalized) return input || '';
  const local = `0${normalized.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

export function whatsappLink(phone, text) {
  const normalized = normalizePyPhone(phone);
  if (!normalized) return null;
  const base = `https://wa.me/${normalized.slice(1)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
