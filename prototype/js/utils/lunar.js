// Vietnamese Lunar Calendar - Solar/Lunar date conversion
// Uses pre-computed Lunar New Year dates for accuracy

// Lunar New Year dates (solar) from 1901-2100
// Format: [year, month, day] = solar date of Lunar 1/1/year
const lunarNewYears = {
  1901: [1901, 2, 13], 1902: [1902, 2, 3], 1903: [1903, 2, 23], 1904: [1904, 2, 12],
  1905: [1905, 2, 1], 1906: [1906, 1, 22], 1907: [1907, 2, 10], 1908: [1908, 1, 31],
  1909: [1909, 1, 21], 1910: [1910, 2, 9], 1911: [1911, 1, 30], 1912: [1912, 2, 18],
  1913: [1913, 2, 7], 1914: [1914, 1, 28], 1915: [1915, 2, 16], 1916: [1916, 2, 5],
  1917: [1917, 1, 26], 1918: [1918, 2, 14], 1919: [1919, 2, 4], 1920: [1920, 1, 24],
  1921: [1921, 2, 12], 1922: [1922, 2, 2], 1923: [1923, 1, 23], 1924: [1924, 2, 11],
  1925: [1925, 2, 1], 1926: [1926, 1, 22], 1927: [1927, 2, 10], 1928: [1928, 1, 30],
  1929: [1929, 1, 20], 1930: [1930, 2, 8], 1931: [1931, 1, 29], 1932: [1932, 2, 17],
  1933: [1933, 2, 6], 1934: [1934, 1, 27], 1935: [1935, 2, 15], 1936: [1936, 2, 4],
  1937: [1937, 1, 24], 1938: [1938, 2, 12], 1939: [1939, 2, 2], 1940: [1940, 1, 23],
  1941: [1941, 2, 11], 1942: [1942, 1, 31], 1943: [1943, 2, 18], 1944: [1944, 2, 7],
  1945: [1945, 1, 28], 1946: [1946, 2, 16], 1947: [1947, 2, 6], 1948: [1948, 1, 26],
  1949: [1949, 2, 13], 1950: [1950, 2, 3], 1951: [1951, 1, 24], 1952: [1952, 2, 12],
  1953: [1953, 2, 1], 1954: [1954, 1, 23], 1955: [1955, 2, 10], 1956: [1956, 1, 31],
  1957: [1957, 1, 21], 1958: [1958, 2, 9], 1959: [1959, 1, 30], 1960: [1960, 2, 17],
  1961: [1961, 2, 6], 1962: [1962, 1, 28], 1963: [1963, 2, 15], 1964: [1964, 2, 5],
  1965: [1965, 1, 26], 1966: [1966, 2, 14], 1967: [1967, 2, 3], 1968: [1968, 1, 24],
  1969: [1969, 2, 11], 1970: [1970, 1, 31], 1971: [1971, 2, 19], 1972: [1972, 2, 8],
  1973: [1973, 1, 29], 1974: [1974, 2, 17], 1975: [1975, 2, 6], 1976: [1976, 1, 27],
  1977: [1977, 2, 15], 1978: [1978, 2, 4], 1979: [1979, 1, 25], 1980: [1980, 2, 12],
  1981: [1981, 2, 1], 1982: [1982, 1, 23], 1983: [1983, 2, 12], 1984: [1984, 2, 2],
  1985: [1985, 1, 22], 1986: [1986, 2, 11], 1987: [1987, 1, 31], 1988: [1988, 2, 18],
  1989: [1989, 2, 7], 1990: [1990, 1, 28], 1991: [1991, 2, 15], 1992: [1992, 2, 4],
  1993: [1993, 1, 24], 1994: [1994, 2, 12], 1995: [1995, 2, 2], 1996: [1996, 1, 22],
  1997: [1997, 2, 10], 1998: [1998, 1, 30], 1999: [1999, 2, 17], 2000: [2000, 2, 7],
  2001: [2001, 1, 24], 2002: [2002, 2, 13], 2003: [2003, 2, 1], 2004: [2004, 1, 22],
  2005: [2005, 2, 9], 2006: [2006, 1, 29], 2007: [2007, 2, 18], 2008: [2008, 2, 7],
  2009: [2009, 1, 26], 2010: [2010, 2, 14], 2011: [2011, 2, 3], 2012: [2012, 1, 23],
  2013: [2013, 2, 10], 2014: [2014, 1, 31], 2015: [2015, 2, 19], 2016: [2016, 2, 8],
  2017: [2017, 1, 28], 2018: [2018, 2, 16], 2019: [2019, 2, 5], 2020: [2020, 1, 25],
  2021: [2021, 2, 12], 2022: [2022, 2, 1], 2023: [2023, 1, 22], 2024: [2024, 2, 10],
  2025: [2025, 1, 29], 2026: [2026, 1, 17], 2027: [2027, 2, 6], 2028: [2028, 1, 26],
  2029: [2029, 2, 13], 2030: [2030, 2, 3], 2031: [2031, 1, 24], 2032: [2032, 2, 11],
  2033: [2033, 1, 31], 2034: [2034, 2, 20], 2035: [2035, 2, 8], 2036: [2036, 1, 28],
  2037: [2037, 2, 16], 2038: [2038, 2, 5], 2039: [2039, 1, 26], 2040: [2040, 2, 14],
  2041: [2041, 2, 3], 2042: [2042, 1, 24], 2043: [2043, 2, 11], 2044: [2044, 1, 31],
  2045: [2045, 2, 20], 2046: [2046, 2, 8], 2047: [2047, 1, 29], 2048: [2048, 2, 17],
  2049: [2049, 2, 6], 2050: [2050, 1, 27], 2051: [2051, 2, 15], 2052: [2052, 2, 3],
  2053: [2053, 2, 23], 2054: [2054, 2, 11], 2055: [2055, 1, 31], 2056: [2056, 2, 19],
  2057: [2057, 2, 8], 2058: [2058, 1, 28], 2059: [2059, 2, 16], 2060: [2060, 2, 5],
  2061: [2061, 1, 26], 2062: [2062, 2, 14], 2063: [2063, 2, 3], 2064: [2064, 1, 24],
  2065: [2065, 2, 11], 2066: [2066, 1, 31], 2067: [2067, 2, 19], 2068: [2068, 2, 8],
  2069: [2069, 1, 29], 2070: [2070, 2, 17], 2071: [2071, 2, 6], 2072: [2072, 1, 26],
  2073: [2073, 2, 14], 2074: [2074, 2, 3], 2075: [2075, 1, 24], 2076: [2076, 2, 11],
  2077: [2077, 2, 1], 2078: [2078, 1, 22], 2079: [2079, 2, 10], 2080: [2080, 1, 30],
  2081: [2081, 2, 18], 2082: [2082, 2, 7], 2083: [2083, 1, 28], 2084: [2084, 2, 16],
  2085: [2085, 2, 5], 2086: [2086, 1, 26], 2087: [2087, 2, 13], 2088: [2088, 2, 2],
  2089: [2089, 1, 23], 2090: [2090, 2, 11], 2091: [2091, 1, 31], 2092: [2092, 2, 19],
  2093: [2093, 2, 8], 2094: [2094, 1, 28], 2095: [2095, 2, 16], 2096: [2096, 2, 5]
};

// Lunar month structure data
// For each year: [month1_days, month2_days, ..., leap_month_number, leap_month_days]
// leap_month_number = 0 means no leap month
const lunarYearData = {};

// Build lunar year data from LNY dates
function buildLunarYearData() {
  const years = Object.keys(lunarNewYears).map(Number).sort((a, b) => a - b);

  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const lny = lunarNewYears[year];
    const lnyDate = new Date(lny[0], lny[1] - 1, lny[2]);

    // Find the next LNY to determine year boundaries
    const nextLny = i < years.length - 1 ? lunarNewYears[years[i + 1]] : null;
    let yearEnd;
    if (nextLny) {
      yearEnd = new Date(nextLny[0], nextLny[1] - 1, nextLny[2]);
      yearEnd = new Date(yearEnd.getTime() - 86400000); // day before next LNY
    } else {
      yearEnd = new Date(lnyDate.getFullYear(), 11, 31);
    }

    const totalDays = Math.floor((yearEnd - lnyDate) / 86400000) + 1;

    // Determine number of months (12 or 13)
    const hasLeap = totalDays >= 383;
    const numMonths = hasLeap ? 13 : 12;

    // Distribute days across months (alternating 30/29 pattern)
    const months = [];
    let remaining = totalDays;

    if (hasLeap) {
      // 13 months: find leap month position
      // Typical pattern: leap month follows a specific month
      // For simplicity, we'll use a standard distribution
      const leapPositions = {
        1903: 3, 1906: 6, 1909: 5, 1912: 4, 1915: 2, 1918: 4,
        1921: 5, 1924: 8, 1927: 7, 1930: 5, 1933: 4, 1936: 3,
        1939: 6, 1942: 5, 1944: 2, 1947: 6, 1950: 2, 1953: 4,
        1956: 3, 1959: 7, 1962: 6, 1964: 1, 1967: 5, 1970: 4,
        1973: 7, 1976: 6, 1979: 5, 1982: 4, 1984: 2, 1987: 6,
        1990: 5, 1993: 4, 1996: 3, 1998: 1, 2001: 4, 2004: 2,
        2007: 6, 2010: 5, 2013: 4, 2016: 3, 2018: 1, 2021: 4,
        2024: 2, 2027: 6, 2030: 5, 2033: 3, 2036: 2, 2039: 5,
        2042: 4, 2045: 3, 2048: 2, 2051: 5, 2054: 4, 2057: 3,
        2059: 1, 2062: 4, 2065: 3, 2068: 2, 2071: 5, 2074: 4,
        2077: 3, 2079: 1, 2082: 4, 2085: 3, 2088: 2, 2091: 5,
        2094: 4, 2097: 3, 2100: 2
      };

      const leapMonth = leapPositions[year] || 4;
      let monthNum = 1;

      while (monthNum <= 13 && remaining > 0) {
        const isLeap = monthNum === (leapMonth + 1);
        // Alternate 30/29 starting with 30
        const days = ((monthNum + (isLeap ? 0 : 0)) % 2 === 1) ? 30 : 29;
        const actualDays = Math.min(days, remaining);
        months.push(actualDays);
        remaining -= actualDays;
        monthNum++;
      }

      lunarYearData[year] = { months, leapMonth };
    } else {
      // 12 months
      let monthNum = 1;
      while (monthNum <= 12 && remaining > 0) {
        const days = (monthNum % 2 === 1) ? 30 : 29;
        const actualDays = Math.min(days, remaining);
        months.push(actualDays);
        remaining -= actualDays;
        monthNum++;
      }

      // Adjust last month if needed
      if (months.length === 12) {
        const sum = months.reduce((a, b) => a + b, 0);
        if (sum !== totalDays) {
          months[11] += (totalDays - sum);
        }
      }

      lunarYearData[year] = { months, leapMonth: 0 };
    }
  }
}

buildLunarYearData();

// Convert solar date to lunar date
function solarToLunar(solarYear, solarMonth, solarDay) {
  const targetDate = new Date(solarYear, solarMonth - 1, solarDay);

  // Find which lunar year this date falls in
  for (const [yearStr, lny] of Object.entries(lunarNewYears)) {
    const year = Number(yearStr);
    const lnyDate = new Date(lny[0], lny[1] - 1, lny[2]);

    // Get next LNY
    const nextYear = year + 1;
    const nextLny = lunarNewYears[nextYear];
    if (!nextLny) continue;
    const nextLnyDate = new Date(nextLny[0], nextLny[1] - 1, nextLny[2]);

    if (targetDate >= lnyDate && targetDate < nextLnyDate) {
      // This date is in lunar year `year`
      const dayOfYear = Math.floor((targetDate - lnyDate) / 86400000);
      const data = lunarYearData[year];
      if (!data) return { year, month: 1, day: 1, isLeapMonth: false };

      let dayRemaining = dayOfYear;
      let month = 1;
      let isLeapMonth = false;

      for (let i = 0; i < data.months.length; i++) {
        const monthDays = data.months[i];
        if (i === data.leapMonth) {
          isLeapMonth = true;
        }
        if (dayRemaining < monthDays) {
          return { year, month: i + 1, day: dayRemaining + 1, isLeapMonth };
        }
        dayRemaining -= monthDays;
        if (i !== data.leapMonth || !isLeapMonth) {
          month = i + 2;
        }
        isLeapMonth = false;
      }

      return { year, month: 12, day: 29, isLeapMonth: false };
    }
  }

  // Fallback
  return { year: solarYear, month: 1, day: 1, isLeapMonth: false };
}

// Vietnamese Heavenly Stems and Earthly Branches
const stems = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const branches = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

function getVietnameseYearName(year) {
  const stemIdx = ((year - 4) % 10 + 10) % 10;
  const branchIdx = ((year - 4) % 12 + 12) % 12;
  return `${stems[stemIdx]} ${branches[branchIdx]}`;
}

const lunarMonthNamesVi = ['', 'Môt', 'Hai', 'Ba', 'Bôn', 'Nam', 'Sau', 'Bay', 'Tâm', 'Chín', 'Muơi', 'Tư', 'Chuong'];

function formatLunarDateVi(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
  const prefix = isLeapMonth ? 'Nhuong ' : '';
  return `${lunarDay}/${prefix}${lunarMonthNamesVi[lunarMonth] || lunarMonth}/${lunarYear}`;
}

function formatLunarDateEn(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
  const prefix = isLeapMonth ? 'Leap ' : '';
  return `${lunarDay} ${prefix}Month ${lunarMonth} ${lunarYear} AL`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

const monthNamesVi = ['', 'Thang 1', 'Thang 2', 'Thang 3', 'Thang 4', 'Thang 5', 'Thang 6', 'Thang 7', 'Thang 8', 'Thang 9', 'Thang 10', 'Thang 11', 'Thang 12'];
const monthNamesEn = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNamesVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export {
  solarToLunar,
  getVietnameseYearName,
  formatLunarDateVi,
  formatLunarDateEn,
  getDaysInMonth,
  getFirstDayOfMonth,
  monthNamesVi,
  monthNamesEn,
  dayNamesVi,
  dayNamesEn,
  lunarMonthNamesVi
};
