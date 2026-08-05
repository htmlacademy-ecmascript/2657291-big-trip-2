import { mockDestination } from '../mock/destination';
import { mockOffers } from '../mock/offers';
import { mockRoutePoint } from '../mock/points';

export default class PointModel {
  #points = mockRoutePoint;
  #offers = mockOffers;
  #destinations = mockDestination;

  get points() {
    return this.#points;
  }

  get offers() {
    return this.#offers;
  }

  set points(newPoints) {
    this.#points = newPoints;
  }

  get destinations() {
    return this.#destinations;
  }

  getDestinationById(id) {
    return this.#destinations.find((item) => item.id === id);
  }

  getOffersByType(point) {
    const found = this.#offers.find((offer) => offer.type === point.type);
    return found ? found.offers : [];
  }

  getOffersByPoint(point) {
    return this.getOffersByType(point).filter((typeOffer) => point.offers.includes(typeOffer.id));
  }

  getDestinationByPoint(point) {
    return this.destinations.find((destination) => destination.id === point.destination);
  }

  isChecked(point, offerId) {
    return point.offers.includes(offerId);
  }

  updatePoint(updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);
    if (index === -1) {
      return false;
    }
    this.#points[index] = updatedPoint;
    return true;
  }

  addPoint(newPoint) {
    this.#points.push(newPoint);
    return newPoint;
  }

  deletePoint(id) {
    const index = this.#points.findIndex((point) => point.id === id);
    if (index === -1) {
      return false;
    }
    this.#points.splice(index, 1);
    return true;
  }
}

