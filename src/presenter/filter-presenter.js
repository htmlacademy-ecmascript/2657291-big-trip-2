import { render } from '../framework/render.js';
import FilterView from '../view/filters-view.js';
import { FilterType, FILTER_NAMES } from '../const.js';

export default class FilterPresenter {
  #filterContainer = null;
  #filterModel = null;
  #filterView = null;
  #onFilterChange = null;
  #pointModel = null;

  constructor({ filterContainer, filterModel, onFilterChange, pointModel }) {
    this.#filterContainer = filterContainer;
    this.#filterModel = filterModel;
    this.#onFilterChange = onFilterChange;
    this.#pointModel = pointModel;
  }

  init() {
    this.#renderFilter();
  }

  // Выносим создание фильтров в отдельный метод
  #renderFilter() {
    const filters = Object.values(FilterType).map((type) => ({
      type,
      name: FILTER_NAMES[type],
      count: this.#getFilterCount(type)
    }));

    this.#filterView = new FilterView({
      filters: filters,
      currentFilterType: this.#filterModel.filter,
      onFilterChange: this.#handleFilterChange
    });

    render(this.#filterView, this.#filterContainer);
    this.#filterView.setFilterChangeHandler();
  }

  #handleFilterChange = (filterType) => {
    this.#filterModel.setFilter(filterType);

    // Перерисовываем фильтры
    //this.#filterView.element.remove();
    this.#filterView.removeElement();
    this.#renderFilter();

    if (this.#onFilterChange) {
      this.#onFilterChange(filterType);
    }
  };

  #getFilterCount(filterType) {
    const points = this.#pointModel?.points || [];

    switch (filterType) {
      case FilterType.EVERYTHING:
        return points.length;
      case FilterType.FUTURE:
        return points.filter((point) => new Date(point.dateFrom) > new Date()).length;
      case FilterType.PRESENT:
        return points.filter((point) => {
          const now = new Date();
          const from = new Date(point.dateFrom);
          const to = new Date(point.dateTo);
          return from <= now && to >= now;
        }).length;
      case FilterType.PAST:
        return points.filter((point) => new Date(point.dateTo) < new Date()).length;
      default:
        return 0;
    }
  }
}
