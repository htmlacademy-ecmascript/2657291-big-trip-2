import { mockRoutePoint } from '../mock/points';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { nanoid } from 'nanoid';

dayjs.extend(duration);

export const isEscape = ({ key }) => key === 'Escape';

const DATE_FORMAT = 'D MMMM';

export const getRandomNumber = () => {
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
  if (!dateFrom || !dateTo) {
    return '';
  }

  const diff = dayjs(dateTo).diff(dayjs(dateFrom));
  const dur = dayjs.duration(diff);

  const days = Math.floor(dur.asDays());
  const hours = dur.hours();
  const minutes = dur.minutes();

  const pad = (num) => String(num).padStart(2, '0');

  if (days === 0 && hours === 0) {
    return `${minutes}M`;
  } else if (days === 0) {
    return `${pad(hours)}H ${pad(minutes)}M`;
  } else {
    return `${pad(days)}D ${pad(hours)}H ${pad(minutes)}M`;
  }
}

export function formatDateForInput(date) {
  if (!date) {
    return '';
  }

  const parsedDate = dayjs(date);

  const day = String(parsedDate.date()).padStart(2, '0');
  const month = String(parsedDate.month() + 1).padStart(2, '0');
  const year = String(parsedDate.year()).slice(-2);
  const hours = String(parsedDate.hour()).padStart(2, '0');
  const minutes = String(parsedDate.minute()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function getRandomPoint() {
  return {
    id: nanoid(),
    ...getRandomNumber(mockRoutePoint)
  };
}

export function isDatesEqual(dateA, dateB) {
  if (dateA === null && dateB === null) {
    return true;
  }
  if (dateA === null || dateB === null) {
    return false;
  }
  return dayjs(dateA).isSame(dayjs(dateB), 'day');
}
