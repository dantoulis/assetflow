export const daysAgo = (days: number, hour = 9, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

export const daysFromNow = (days: number, hour = 9, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

export const addHours = (date: Date, hours: number) => {
  const nextDate = new Date(date);
  nextDate.setHours(nextDate.getHours() + hours);
  return nextDate;
};

export const addDays = (date: Date, days: number, hour = 9, minute = 0) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  nextDate.setHours(hour, minute, 0, 0);
  return nextDate;
};
