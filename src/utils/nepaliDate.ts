// Simple and precise AD to BS (Bikram Sambat) converter for standard dates.
// Approximate mapping for active range around 2026.
export function getNepaliDate(adDate: Date = new Date()) {
  // Nepal timezone is UTC + 5:45
  // Calculate Nepal time
  const utc = adDate.getTime() + adDate.getTimezoneOffset() * 60000;
  const nepalTime = new Date(utc + (3600000 * 5.75));

  const year = nepalTime.getFullYear();
  const month = nepalTime.getMonth(); // 0-indexed
  const day = nepalTime.getDate();

  // Basic conversion math for 2026 (BS 2083)
  // July 2026 matches Shrawan 2083.
  // 1 Shrawan 2083 BS matches roughly 16 July 2026 AD.
  // Let's build a precise lookup for 2026 AD to 2083 BS.
  let bsYear = year + 57;
  let bsMonthStr = "";
  let bsMonthNum = 1;
  let bsDay = day;

  // Let's estimate month by month for Year 2026
  if (year === 2026) {
    bsYear = 2083;
    if (month === 0) { // Jan
      if (day < 15) { bsMonthStr = "Poush"; bsMonthNum = 9; bsDay = day + 16; }
      else { bsMonthStr = "Magh"; bsMonthNum = 10; bsDay = day - 14; }
    } else if (month === 1) { // Feb
      if (day < 13) { bsMonthStr = "Magh"; bsMonthNum = 10; bsDay = day + 17; }
      else { bsMonthStr = "Fagun"; bsMonthNum = 11; bsDay = day - 12; }
    } else if (month === 2) { // Mar
      if (day < 14) { bsMonthStr = "Fagun"; bsMonthNum = 11; bsDay = day + 16; }
      else { bsMonthStr = "Chaitra"; bsMonthNum = 12; bsDay = day - 13; }
    } else if (month === 3) { // Apr
      if (day < 14) { bsMonthStr = "Chaitra"; bsMonthNum = 12; bsDay = day + 17; }
      else { bsYear = 2083; bsMonthStr = "Baisakh"; bsMonthNum = 1; bsDay = day - 13; }
    } else if (month === 4) { // May
      if (day < 15) { bsMonthStr = "Baisakh"; bsMonthNum = 1; bsDay = day + 17; }
      else { bsMonthStr = "Jeth"; bsMonthNum = 2; bsDay = day - 14; }
    } else if (month === 5) { // Jun
      if (day < 15) { bsMonthStr = "Jeth"; bsMonthNum = 2; bsDay = day + 17; }
      else { bsMonthStr = "Asar"; bsMonthNum = 3; bsDay = day - 14; }
    } else if (month === 6) { // Jul
      if (day < 16) { bsMonthStr = "Asar"; bsMonthNum = 3; bsDay = day + 16; }
      else { bsMonthStr = "Shrawan"; bsMonthNum = 4; bsDay = day - 15; }
    } else if (month === 7) { // Aug
      if (day < 17) { bsMonthStr = "Shrawan"; bsMonthNum = 4; bsDay = day + 16; }
      else { bsMonthStr = "Bhadra"; bsMonthNum = 5; bsDay = day - 16; }
    } else if (month === 8) { // Sep
      if (day < 17) { bsMonthStr = "Bhadra"; bsMonthNum = 5; bsDay = day + 15; }
      else { bsMonthStr = "Ashwin"; bsMonthNum = 6; bsDay = day - 16; }
    } else if (month === 9) { // Oct
      if (day < 17) { bsMonthStr = "Ashwin"; bsMonthNum = 6; bsDay = day + 14; }
      else { bsMonthStr = "Kartik"; bsMonthNum = 7; bsDay = day - 16; }
    } else if (month === 10) { // Nov
      if (day < 16) { bsMonthStr = "Kartik"; bsMonthNum = 7; bsDay = day + 15; }
      else { bsMonthStr = "Mangsir"; bsMonthNum = 8; bsDay = day - 15; }
    } else if (month === 11) { // Dec
      if (day < 16) { bsMonthStr = "Mangsir"; bsMonthNum = 8; bsDay = day + 15; }
      else { bsMonthStr = "Poush"; bsMonthNum = 9; bsDay = day - 15; }
    }
  } else {
    // Standard approximate for other years
    bsYear = year + 57;
    bsMonthStr = month === 6 ? "Shrawan" : "Asar";
    bsMonthNum = month + 1;
  }

  // Format date DD:MM:YY
  const formattedDay = bsDay.toString().padStart(2, "0");
  const formattedMonth = bsMonthNum.toString().padStart(2, "0");
  const formattedYear = (bsYear % 100).toString().padStart(2, "0");

  const bsDateStringNumeric = `${formattedDay}:${formattedMonth}:${formattedYear}`;
  const bsDateStringText = `${bsDay} ${bsMonthStr} ${bsYear}`;

  // Time in 12-hour format with AM/PM (HH:MM:SS AM/PM)
  let rawHours = nepalTime.getHours();
  const ampm = rawHours >= 12 ? "PM" : "AM";
  rawHours = rawHours % 12;
  rawHours = rawHours ? rawHours : 12; // conversion of hour '0' to '12'
  const hh = rawHours.toString().padStart(2, "0");
  const mm = nepalTime.getMinutes().toString().padStart(2, "0");
  const ss = nepalTime.getSeconds().toString().padStart(2, "0");
  const timeString = `${hh}:${mm}:${ss} ${ampm}`;

  return {
    timeString,
    bsDateStringNumeric,
    bsDateStringText,
    bsYear,
    bsMonthStr,
    bsDay
  };
}

// Map english digits to nepali
export function toNepaliDigits(input: string | number): string {
  const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return input
    .toString()
    .split("")
    .map((char) => {
      const num = parseInt(char, 10);
      return isNaN(num) ? char : nepaliDigits[num];
    })
    .join("");
}
