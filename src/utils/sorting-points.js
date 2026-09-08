import { SortType } from '../const.js';

export const getSortingPoints = {
  [SortType.DAY]: (points) =>
    [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom)),

  [SortType.EVENT]: (points) =>
    [...points].sort((a, b) => a.type.localeCompare(b.type)),

  [SortType.TIME]: (points) =>
    [...points].sort((a, b) => {
      const durationA =
        new Date(a.dateTo) - new Date(a.dateFrom);

      const durationB =
        new Date(b.dateTo) - new Date(b.dateFrom);

      return durationB - durationA;
    }),

  [SortType.PRICE]: (points) =>
    [...points].sort((a, b) => b.basePrice - a.basePrice),

  [SortType.OFFERS]: (points) =>
    [...points].sort((a, b) => b.offers.length - a.offers.length),
};
