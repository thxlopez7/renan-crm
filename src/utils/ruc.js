// Paraguayan RUC: base number + check digit (módulo 11, base 11, the SET algorithm)
export function rucCheckDigit(base) {
  let total = 0;
  let k = 2;
  for (let i = base.length - 1; i >= 0; i--) {
    total += Number(base[i]) * k;
    k = k >= 11 ? 2 : k + 1;
  }
  const rest = total % 11;
  return rest > 1 ? 11 - rest : 0;
}

export function isValidRuc(input) {
  const clean = String(input || '').replace(/[\s.]/g, '');
  const match = clean.match(/^(\d{3,9})-(\d)$/);
  return Boolean(match) && rucCheckDigit(match[1]) === Number(match[2]);
}
