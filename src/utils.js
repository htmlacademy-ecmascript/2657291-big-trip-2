import { mockRoutePoint } from './route-point.js';

export const getRandomPoints = () => {
  const randomIndex = Math.floor(Math.random() * mockRoutePoint.length);
  return mockRoutePoint[randomIndex];
};
