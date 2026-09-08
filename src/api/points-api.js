import { EndPoints, Method } from '../const.js';
import ApiService from '../framework/api-service.js';

export default class PointsApiService extends ApiService {

  async getPoints() {
    const response = await this._load({
      url: EndPoints.POINTS,
    });
    const result = await ApiService.parseResponse(response);
    return result.map(this.#adaptToClient);
  }

  async updatePoint(point) {
    const response = await this._load({
      url: EndPoints.POINT.replace(':id', point.id),
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return this.#adaptToClient(parsedResponse);
  }

  async addPoint(point) {
    const response = await this._load({
      url: EndPoints.POINTS,
      method: Method.POST,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const parsedResponse = await ApiService.parseResponse(response);
    return this.#adaptToClient(parsedResponse);
  }

  async deletePoint(id) {
    const response = await this._load({
      url: EndPoints.POINT.replace(':id', id),
      method: Method.DELETE,
    });

    return response;
  }

  #adaptToClient(point) {
    const adaptedPoint = {
      ...point,

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

  #adaptToServer(point) {
    const adaptedPoint = {
      ...point,
      'base_price': Number(point.basePrice),
      'date_from': point.dateFrom ? new Date(point.dateFrom).toISOString() : null,
      'date_to': point.dateTo ? new Date(point.dateTo).toISOString() : null,
      'is_favorite': point.isFavorite ?? false,
    };

    delete adaptedPoint.basePrice;
    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;
    delete adaptedPoint.isFavorite;

    return adaptedPoint;
  }
}
