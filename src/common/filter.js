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

export function generateFilters(points) {
  return Object.entries(filter).map(([filterType, filterPoints]) => ({
    type: filterType,
    count: filterPoints(points).length
  }));
}
