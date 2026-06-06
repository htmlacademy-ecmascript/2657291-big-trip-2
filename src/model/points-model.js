import { mockDestination } from '../mock/destination';
import { mockOffers } from '../mock/offers';
import { mockRoutePoint } from '../mock/points';

export default class PointModel {
  constructor() {
    this.points = [];
    this.offers = [];
    this.destinations = [];
  }

  init() {
    this.points = mockRoutePoint;
    this.offers = mockOffers;
    this.destinations = mockDestination;
  }

  getPoints() {
    return this.points;
  }

  getOffers() {
    return this.offers;
  }

  getDestinations() {
    return this.destinations;
  }
}
