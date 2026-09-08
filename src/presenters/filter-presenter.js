import { UpdateType } from '../const.js';
import { render } from '../framework/render.js';
import { getAvailableFilters } from '../utils/filter.js';
import FilterView from '../views/filter-view.js';

export default class FilterPresenter {
  #filterModel = null;
  #pointsModel = null;

  #filterView = null;

  constructor({
    filterModel,
    pointsModel,
  }) {
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  init(container) {
    this.#filterView = new FilterView({
      filters: this.#getFilters(),
      onFilterChange: this.#handleFilterChange,
    });

    render(
      this.#filterView,
      container
    );
  }

  #getFilters() {
    const currentFilter = this.#filterModel.filter;

    const result = getAvailableFilters(this.#pointsModel.points, currentFilter);
    return result;
  }

  #handleModelEvent = () => {
    this.#filterView.updateElement({
      filters: this.#getFilters(),
    });
  };

  #handleFilterChange = (filterType) => {
    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
