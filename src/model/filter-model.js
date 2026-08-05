import { FilterType } from '../const.js';

export default class FilterModel {
  #currentFilter = FilterType.EVERYTHING;

  get filter() {
    return this.#currentFilter;
  }

  setFilter(newFilter) {
    this.#currentFilter = newFilter;
  }
}
