import dayjs from 'dayjs';
import { FilterType } from '../const.js';

function isPointPast(dateTo) {
  return dayjs(dateTo).isBefore(dayjs(), 'day');
}

function isPointFuture(dateFrom) {
  return dayjs(dateFrom).isAfter(dayjs(), 'day');
}

function isPointPresent(dateFrom, dateTo) {
  const today = dayjs();
  return dayjs(dateFrom).isSame(today, 'day') ||
         dayjs(dateTo).isSame(today, 'day') ||
         (dayjs(dateFrom).isBefore(today, 'day') && dayjs(dateTo).isAfter(today, 'day'));
}

export const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => isPointFuture(point.dateFrom)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPointPresent(point.dateFrom, point.dateTo)),
  [FilterType.PAST]: (points) => points.filter((point) => isPointPast(point.dateTo))
};

const FILTER_NAMES = {
  [FilterType.EVERYTHING]: 'Everything',
  [FilterType.FUTURE]: 'Future',
  [FilterType.PRESENT]: 'Present',
  [FilterType.PAST]: 'Past'
};

export function generateFilters(points) {
  const filters = Object.entries(filter).map(([filterType, filterPoints]) => ({
    type: filterType,
    name: FILTER_NAMES[filterType],
    count: filterPoints(points).length
  }));

  return filters;
}
