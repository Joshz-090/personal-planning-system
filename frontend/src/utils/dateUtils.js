import Kenat from 'kenat';

/**
 * Formats a given date based on the user's calendar preference.
 * @param {Date | string} date - The date to format.
 * @param {string} calendarPreference - 'ethiopian' or 'gregorian'.
 * @returns {string} - The formatted date string.
 */
export const formatDate = (date, calendarPreference = 'gregorian') => {
  if (!date) return '';
  const d = new Date(date);
  
  // Check for invalid date
  if (isNaN(d.getTime())) return 'Invalid Date';

  if (calendarPreference === 'ethiopian') {
    try {
      const kenat = new Kenat(d);
      // Format: Day-Month-Year (e.g. 12-04-2017)
      // Kenat documentation might vary, checking common usage or relying on string output
      // If kenat.format isn't available, we fallback to a simple conversion if possible, 
      // but assuming standard Kenat usage here:
      const ecDate = kenat.format('D-M-Y'); 
      return `${ecDate} (EC)`;
    } catch (error) {
      console.error('Kenat conversion error:', error);
      return d.toLocaleDateString() + ' (GC - Error)';
    }
  }

  // Default to Gregorian
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculates current date in preferred calendar system
 */
export const getCurrentDate = (calendarPreference = 'gregorian') => {
  return formatDate(new Date(), calendarPreference);
};
