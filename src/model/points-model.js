import Observable from '../framework/observable.js';
//import { mockDestination } from '../mock/destination';
//import { mockOffers } from '../mock/offers';
//import { mockRoutePoint } from '../mock/points';
//import { nanoid } from 'nanoid';
import { UpdateType } from '../const.js';


export default class PointModel extends Observable {
  #pointsApiService = null;
  //#points = mockRoutePoint;
  #points = []; //добавил для проверки
  #offers = [];
  #destinations = [];

  constructor({pointsApiService}) {
    super();
    this.#pointsApiService = pointsApiService;
  }

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

  async init() {
    try {
      const points = await this.#pointsApiService.points;
      this.#points = points.map(this.#adaptToClient);
    } catch(err) {
      this.#points = [];
    }

    this._notify(UpdateType.INIT);
  }

  async updatePoint(updateType, updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);
    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    try {
      const response = await this.#pointsApiService.updatePoint(updatedPoint);
      const adaptedPoint = this.#adaptToClient(response);

      this.#points = [
        ...this.#points.slice(0, index),
        adaptedPoint,
        ...this.#points.slice(index + 1),
      ];
      this._notify(updateType, adaptedPoint);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  }

  async addPoint(updateType, update) {
    try {
      const response = await this.#pointsApiService.addPoint(update);
      const newPoint = this.#adaptToClient(response);

      this.#points = [newPoint, ...this.#points];
      this._notify(updateType, newPoint);
    } catch(err) {
      throw new Error('Can\'t add point');
    }
  }

  async deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    try {
      await this.#pointsApiService.deletePoint(update);
      this.#points = [
        ...this.#points.slice(0, index),
        ...this.#points.slice(index + 1),
      ];
      this._notify(updateType, update);
    } catch(err) {
      throw new Error('Can\'t delete point');
    }
  }

  #adaptToClient(point) {
    const adaptedPoint = {...point,

      basePrice: point['base_price'],
      dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : point['date_from'],
      dateTo: point['date_to'] !== null ? new Date(point['date_to']) : point['date_to'],
      isFavorite: point['is_favorite'],
    };

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  }
}
