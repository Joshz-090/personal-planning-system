/**
 * Ethiopian Calendar Conversion Utility
 * 
 * Converts between Gregorian and Ethiopian calendars
 * Ethiopian calendar has 13 months (12 months of 30 days + 1 month of 5-6 days)
 * Year starts on September 11 (or 12 in leap years) of Gregorian calendar
 */

/**
 * Convert Gregorian date to Ethiopian date
 * @param {Date} gregorianDate - Gregorian date object
 * @returns {Object} Ethiopian date object with {year, month, day, monthName}
 */
export const gregorianToEthiopian = (gregorianDate) => {
  const year = gregorianDate.getFullYear();
  const month = gregorianDate.getMonth() + 1; // JavaScript months are 0-indexed
  const day = gregorianDate.getDate();

  // Calculate days since epoch (August 29, 8 AD in Gregorian = Meskerem 1, 1 EC)
  const epoch = new Date(8, 7, 29); // Year 8, August (month 7), day 29
  const diffTime = gregorianDate - epoch;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Ethiopian calendar calculation
  // Each Ethiopian year has approximately 365.25 days
  let ethYear = Math.floor(diffDays / 365.25) + 1;
  let remainingDays = diffDays % 365.25;

  // Adjust for leap years
  const leapYears = Math.floor((ethYear - 1) / 4);
  remainingDays -= leapYears;

  // Ethiopian months: 12 months of 30 days + Pagumen (5-6 days)
  let ethMonth = Math.floor(remainingDays / 30) + 1;
  let ethDay = Math.floor(remainingDays % 30) + 1;

  // Handle Pagumen (13th month)
  if (ethMonth > 12) {
    ethMonth = 13;
    ethDay = Math.floor(remainingDays % 30);
    if (ethDay === 0) ethDay = 1;
  }

  // Ensure valid day range
  if (ethDay < 1) ethDay = 1;
  if (ethDay > 30 && ethMonth < 13) ethDay = 30;
  if (ethMonth === 13 && ethDay > 6) ethDay = 6;

  const monthNames = [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
    'Megabit', 'Miazia', 'Genbot', 'Sene', 'Hamle', 'Nehase', 'Pagumen'
  ];

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
    monthName: monthNames[ethMonth - 1],
    fullDate: `${ethDay} ${monthNames[ethMonth - 1]} ${ethYear} EC`
  };
};

/**
 * Convert Ethiopian date to Gregorian date
 * @param {number} ethYear - Ethiopian year
 * @param {number} ethMonth - Ethiopian month (1-13)
 * @param {number} ethDay - Ethiopian day
 * @returns {Date} Gregorian date object
 */
export const ethiopianToGregorian = (ethYear, ethMonth, ethDay) => {
  // Calculate days since epoch
  const yearsSinceEpoch = ethYear - 1;
  const leapYears = Math.floor(yearsSinceEpoch / 4);
  const daysFromYears = yearsSinceEpoch * 365 + leapYears;

  // Days from months (first 12 months are 30 days each)
  const daysFromMonths = (ethMonth - 1) * 30;

  // Total days
  const totalDays = daysFromYears + daysFromMonths + (ethDay - 1);

  // Epoch: August 29, 8 AD
  const epoch = new Date(8, 7, 29); // Year 8, August (month 7), day 29
  const gregorianDate = new Date(epoch);
  gregorianDate.setDate(epoch.getDate() + totalDays);

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
    const ethDate = gregorianToEthiopian(date);
    return ethDate.fullDate;
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

