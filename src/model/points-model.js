import { POINT_COUNT } from '../const.js';
import { getRandomPoints } from '../mock/points.js';
import { mockOffers } from '../mock/offers.js';
import { mockDestination } from '../mock/destination.js';

export default class PointModel {
  points = Array.from({ length: POINT_COUNT }, getRandomPoints);
  offers = mockOffers;
  destinations = mockDestination;

  getPoint() {
    return this.points;
  }

  getOffer() {
    return this.offers;
  }

  getOfferByType(type) {
    const allOffers = this.getOffer();

    return allOffers.find((offer) => offer.type === type);
  }

  getOfferById(type, itemsId) {
    const offersType = this.getOfferByType(type);

    return offersType.offers.filter((item) => itemsId.find((id) => item.id === id));
  }

  getDestination() {
    return this.destinations;
  }

  getDestinationById(id) {
    const allDestination = this.getDestination();
    return allDestination.find((item) => item.id === id);
  }
}
