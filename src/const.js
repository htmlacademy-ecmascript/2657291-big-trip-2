export const AUTHORIZATION = `Basic ${crypto.randomUUID()}`;
export const SERVER = 'https://22.objects.htmlacademy.pro/big-trip';

export const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export const EndPoints = {
  POINTS: 'points',
  OFFERS: 'offers',
  DESTINATIONS: 'destinations',
  POINT: 'points/:id'
};

const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

export const DEFAULT_FILTER = FilterType.EVERYTHING;

const SortType = {
  DAY: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFERS: 'offers'
};

export const SortTypeDescriptions = {
  [SortType.DAY]: {
    isDisabled: false,
    name: 'Day',
  },
  [SortType.EVENT]: {
    isDisabled: true,
    name: 'Event',
  },
  [SortType.TIME]: {
    isDisabled: false,
    name: 'Time',
  },
  [SortType.PRICE]: {
    isDisabled: false,
    name: 'Price',
  },
  [SortType.OFFERS]: {
    isDisabled: true,
    name: 'Offers',
  }
};

export const DEFAULT_SORTING = SortType.DAY;

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
};

const POINTS_TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant',
];

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export const SHAKE_ANIMATION_TIMEOUT = 600;

export { FilterType, SortType, UpdateType, POINTS_TYPES, TimeLimit };
