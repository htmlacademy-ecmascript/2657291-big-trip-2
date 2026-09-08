import Observable from '../framework/observable.js';
import { DEFAULT_SORTING } from '../const.js';

export default class SortingModel extends Observable {
  #currentSorting = DEFAULT_SORTING;

  get sortType() {
    return this.#currentSorting;
  }

  setSortType(updateType, sortType) {
    this.#currentSorting = sortType;

    this._notify(updateType, sortType);
  }
}
