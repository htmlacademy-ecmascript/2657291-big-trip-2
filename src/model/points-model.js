import Observable from '../framework/observable.js';
import { mockDestination } from '../mock/destination';
import { mockOffers } from '../mock/offers';
import { mockRoutePoint } from '../mock/points';
import { nanoid } from 'nanoid';

export default class PointModel extends Observable {
  #pointsApiService = null;
  //#points = mockRoutePoint;
  #points = []; //добавил для проверки
  #offers = mockOffers;
  #destinations = mockDestination;

  constructor({pointsApiService}) {
    super();
    this.#pointsApiService = pointsApiService;

    this.#pointsApiService.points.then((points) => {
      console.log(points.map(this.#adaptToClient));
      // Есть проблема: cтруктура объекта похожа, но некоторые ключи называются иначе,
      // а ещё на сервере используется snake_case, а у нас camelCase.
      // Можно, конечно, переписать часть нашего клиентского приложения, но зачем?
      // Есть вариант получше - паттерн "Адаптер"
    });
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

  addPoint(updateType, point) {
    const newPoint = {
      ...point,
      id: point.id || nanoid(), //Генерируем ID только если его нет
    };
    this.#points = [newPoint, ...this.#points];
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
