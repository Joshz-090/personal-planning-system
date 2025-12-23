import Kenat from 'kenat';

/**
 * Ethiopian Calendar Conversion Utility
 * 
 * Uses the Kenat package for accurate Gregorian/Ethiopian conversions
 */

/**
 * Convert Gregorian date to Ethiopian date
 * @param {Date} gregorianDate - Gregorian date object
 * @returns {Object} Ethiopian date object with {year, month, day, monthName, fullDate}
 */
export const gregorianToEthiopian = (gregorianDate) => {
  try {
    const kenat = new Kenat(gregorianDate);
    const eth = kenat.getEthiopian();
    const monthNames = [
      'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
      'Megabit', 'Miazia', 'Genbot', 'Sene', 'Hamle', 'Nehase', 'Pagumen'
    ];
    
    return {
      year: eth.year,
      month: eth.month,
      day: eth.day,
      monthName: monthNames[eth.month - 1],
      fullDate: `${eth.day} ${monthNames[eth.month - 1]} ${eth.year} EC`
    };
  } catch (e) {
    console.error("Kenat conversion error", e);
    return {
      year: 0,
      month: 0,
      day: 0,
      monthName: 'Error',
      fullDate: 'Error'
    };
  }
};

/**
 * Convert Ethiopian date to Gregorian date
 * @param {number} ethYear - Ethiopian year
 * @param {number} ethMonth - Ethiopian month (1-13)
 * @param {number} ethDay - Ethiopian day
 * @returns {Date} Gregorian date object
 */
export const ethiopianToGregorian = (ethYear, ethMonth, ethDay) => {
    // Kenat doesn't seem to have a direct static method for ethToGreg inside the constructor in the current version's usage
    // but we can find the date by searching. However, the existing logic might be okay as a fallback, 
    // but let's try to use Kenat if it supports it.
    // Based on common kenat usage: new Kenat(new Date(year, month, day)) is for GC.
    // If Kenat doesn't support direct ET -> GC, we use the stable mathematical conversion.
    // For now, let's keep a corrected version of the previous logic or check if Kenat has it.
    
    // Actually, let's stick to the stable logic for now if Kenat is primarily GC -> ET.
    // Re-implementing with better accuracy:
    const yearsSinceEpoch = ethYear - 1;
    const leapYears = Math.floor(yearsSinceEpoch / 4);
    const daysFromYears = yearsSinceEpoch * 365 + leapYears;
    const daysFromMonths = (ethMonth - 1) * 30;
    const totalDays = daysFromYears + daysFromMonths + (ethDay - 1);

    const epoch = new Date(Date.UTC(8, 7, 29)); // August 29, 8 AD
    const gregorianDate = new Date(epoch);
    gregorianDate.setUTCDate(epoch.getUTCDate() + totalDays);

    return gregorianDate;
};

/**
 * Format date based on user preference
 * @param {Date} date - Date object
 * @param {string} calendarType - 'ethiopian' or 'gregorian'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, calendarType = 'gregorian') => {
  if (calendarType === 'ethiopian') {
    try {
        const kenat = new Kenat(date);
        return kenat.format('D-M-Y') + ' (EC)';
    } catch (e) {
        return gregorianToEthiopian(date).fullDate;
    }
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get current date in selected calendar format
 * @param {string} calendarType - 'ethiopian' or 'gregorian'
 * @returns {Object} Date object with calendar-specific info
 */
export const getCurrentDate = (calendarType = 'gregorian') => {
  const today = new Date();
  
  if (calendarType === 'ethiopian') {
    return gregorianToEthiopian(today);
  }
  
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    monthName: today.toLocaleDateString('en-US', { month: 'long' }),
    fullDate: formatDate(today, 'gregorian')
  };
};

/**
 * Format time based on user preference
 * @param {Date} date - Date object
 * @param {string} timeFormat - '12' or '24'
 * @returns {string} Formatted time string
 */
export const formatTime = (date, timeFormat = '24') => {
  if (timeFormat === '12') {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};


