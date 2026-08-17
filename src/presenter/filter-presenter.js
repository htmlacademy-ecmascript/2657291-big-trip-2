import { render, replace, remove } from '../framework/render.js';
import FilterView from '../view/filter-view.js';
import { filter } from '../common/filter.js';
import { FilterType, FILTER_NAMES, UpdateType } from '../const.js';

export default class FilterPresenter {
  #filterContainer = null;
  #filterModel = null;
  #pointModel = null;
  #filterComponent = null;

  constructor({ filterContainer, filterModel, pointModel }) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#pointModel = pointModel;

    this.#pointModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get filters() {
    const points = this.#pointModel.points;
    return Object.values(FilterType).map((type) => ({
      type,
      name: FILTER_NAMES[type],
      count: filter[type](points).length,
    }));
  }

  init() {
    const prevFilterComponent = this.#filterComponent;

    this.#filterComponent = new FilterView({
      filters: this.filters,
      currentFilterType: this.#filterModel.filter,
      onFilterChange: this.#handleFilterTypeChange,
    });

    if (prevFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainer);
      return;
    }

    replace(this.#filterComponent, prevFilterComponent);
    remove(prevFilterComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }
    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
