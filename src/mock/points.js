export const mockRoutePoint = [
  {
    id: 'point-1',
    basePrice: 120,
    dateFrom: '2026-08-18T10:30:00',
    dateTo: '2026-08-28T11:00:00',
    destination: '1',
    isFavorite: true,
    offers: ['2t', '1t'],
    type: 'taxi'
  },
  {
    id: 'point-2',
    basePrice: 160,
    dateFrom: '2026-09-18T15:25:00',
    dateTo: '2026-09-19T13:35:00',
    destination: '2',
    isFavorite: false,
    offers: ['1f'],
    type: 'flight'
  },
  {
    id: 'point-3',
    basePrice: 50,
    dateFrom: '2026-10-18T11:15:00',
    dateTo: '2026-10-19T12:15:00',
    destination: '3',
    isFavorite: false,
    offers: ['1si'],
    type: 'sightseeing'
  },
  {
    id: 'point-past',
    basePrice: 30,
    dateFrom: '2024-01-01T10:00:00',
    dateTo: '2024-01-01T12:00:00',
    destination: '1',
    isFavorite: false,
    offers: [],
    type: 'taxi'
  }
];
