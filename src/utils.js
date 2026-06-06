import { mockRoutePoint } from './mock/points';
import dayjs from 'dayjs';

const DATE_FORMAT = 'D MMMM';

export const getRandomPoints = () => {
  const randomIndex = Math.floor(Math.random() * mockRoutePoint.length);
  return mockRoutePoint[randomIndex];
};

export const humanizeTaskDueData = (dueData) => dueData ? dayjs(dueData).format(DATE_FORMAT) : '';

export const formatDate = (date, format) => {
  if (!date) {
    return '';
  }

  switch (format) {
    case 'time':
      return dayjs(date).format('HH:mm');
    case 'date-time':
      return dayjs(date).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    case 'full-date':
      return dayjs(date).format('YYYY-MM-DD');
    case 'custom':
      return dayjs(date).format('MMM DD').toUpperCase();
    default:
      return dayjs(date).format('MMM DD');
  }
};

export function getDuration(dateFrom, dateTo) {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  const difference = end - start; // разница в миллисекундах

  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}H ${restMinutes}M`;
  }
  return `${restMinutes}M`;
}
