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
  const diff = end - start; // разница в миллисекундах

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (3600000)) / (1000 * 60));

  let result = '';

  if (hours > 0) {
    result += `${hours} ч`;
  }

  if (minutes > 0) {
    if (result) {
      result += ' ';
    }
    result += `${minutes} м`;
  }

  if (result === '') {
    result = '0 м';
  }

  return result;
}
