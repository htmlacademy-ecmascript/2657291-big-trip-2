import Observable from '../framework/observable.js';
import { mockDestination } from '../mock/destination';
import { mockOffers } from '../mock/offers';
import { mockRoutePoint } from '../mock/points';

export default class PointModel extends Observable {
  #points = mockRoutePoint;
  #offers = mockOffers;
  #destinations = mockDestination;

  get points() {
    return this.#points;
  }

  get offers() {
    return this.#offers;
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

  updatePoint(updateType, updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);
    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }
    this.#points = [
      ...this.#points.slice(0, index),
      updatedPoint,
      ...this.#points.slice(index + 1),
    ];
    this._notify(updateType, updatedPoint);
  }

  addPoint(updateType, newPoint) {
    this.#points = [
      newPoint,
      ...this.#points,
    ];
    this._notify(updateType, newPoint);
  }

  deletePoint(updateType, id) {
    const index = this.#points.findIndex((point) => point.id === id);
    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }
    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];
    this._notify(updateType, id);
  }
}
