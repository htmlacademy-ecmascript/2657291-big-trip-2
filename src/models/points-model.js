import { UpdateType } from '../const.js';
import Observable from '../framework/observable.js';

export default class PointModel extends Observable {
  #points = [];
  #server = null;
  #isLoadingFailed = false;
  #isLoading = false;

  constructor(server) {
    super();
    this.#server = server;
  }

  async init() {
    this.#isLoading = true;
    try {
      this.#points = await this.#server.getPoints();
      this.#isLoadingFailed = false;
    } catch (error) {
      this.#points = [];
      this.#isLoadingFailed = true;
    } finally {
      this.#isLoading = false;
      this._notify(UpdateType.INIT);
    }
  }

  get points() {
    return [...this.#points];
  }

  async changePointFavorite(id) {
    const point = this.getPointById(id);
    const index = this.#points.findIndex((item) => item.id === id);

    const updatedPoint = {
      ...point,
      isFavorite: !point.isFavorite
    };

    const response = await this.#server.updatePoint(updatedPoint);

    this.#points = [
      ...this.#points.slice(0, index),
      response,
      ...this.#points.slice(index + 1)
    ];

    this._notify(UpdateType.PATCH, response);
  }

  getPointById(id) {
    return this.#points.find((item) => item.id === id);
  }

  async addPoint(point) {
    const newPoint = await this.#server.addPoint(point);
    this.#points = [...this.#points, newPoint];
    this._notify(UpdateType.MAJOR);
  }

  async updatePoint(point) {
    try {
      const index = this.#points.findIndex((item) => item.id === point.id);
      if (index === -1) {
        return;
      }
      const updatedPoint = await this.#server.updatePoint(point);

      this.#points = [
        ...this.#points.slice(0, index),
        updatedPoint,
        ...this.#points.slice(index + 1),
      ];

      this._notify(UpdateType.MAJOR);
    } catch (error) {
      throw new Error();
    }
  }

  async deletePoint(id) {
    await this.#server.deletePoint(id);
    this.#points = this.#points.filter((point) => point.id !== id);
    this._notify(UpdateType.MAJOR);
  }

  get isLoading() {
    return this.#isLoading;
  }

  get isLoadingFailed() {
    return this.#isLoadingFailed;
  }
}
