/**
 * Formatting utilities for BlackClubElite
 * Strictly adheres to corporate luxury guidelines:
 * - Guaraníes format with dot separator and Gs. suffix (e.g. 150.000 Gs.)
 * - Strict prohibition of emojis
 * - Tabular numbers and clean executive date/time formatting
 */

export function formatGs(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0 Gs.';
  }
  const rounded = Math.round(Number(value));
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} Gs.`;
}

export function formatShortDate(dateStr) {
  try {
    const [_year, month, day] = dateStr.split('-');
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'
    ];
    const monthName = months[parseInt(month, 10) - 1] || month;
    return `${parseInt(day, 10)} ${monthName}`;
  } catch {
    return dateStr;
  }
}

export function formatFullDate(dateStr) {
  try {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const d = new Date(dateStr + 'T12:00:00');
    return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}
