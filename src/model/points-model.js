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

  getDestinationById(id) {
    return this.destinations.find((item) => item.id === id);
  }

  getOffersByType(point) {
    return this.offers.find((offer) => offer.type === point.type).offers;
  }

  getOffersByPoint(point) {
    return this.getOffersByType(point).filter((typeOffer) => point.offers.includes(typeOffer.id));
  }

  getDestinationByPoint(point) {
    return this.getDestinations().find((destination) => destination.id === point.destination);
  }

  isChecked(point, offerId) {
    return point.offers.includes(offerId);
  }
}
