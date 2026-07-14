import { render } from '../framework/render.js';
import FilterView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import PointPresenter from './point-presenter.js';
import { generateFilters, filter } from '../common/filter.js';
import { FilterType } from '../const.js';
import EmptyView from '../view/empty-view.js';
import { updateItem } from '../common/utils.js';
export default class BoardPresenter {
  #filterComponent = null;
  #sortComponent = new SortView();
  #pointList = new PointListView();

  #allPoints = [];
  #filterContainer = null;
  #contentContainer = null;
  #pointModel = null;
  #currentFilterType = FilterType.EVERYTHING;

  constructor({ filterContainer, contentContainer, pointModel }) {
    this.#filterContainer = filterContainer;
    this.#contentContainer = contentContainer;
    this.#pointModel = pointModel;
  }

  init() {
    this.#allPoints = [...this.#pointModel.points];
    this.#renderBoard();
    this.#renderFilters();
  }

  #renderBoard() {
    render(this.#sortComponent, this.#contentContainer);
    render(this.#pointList, this.#contentContainer);

    this.#renderPoints();
  }

  #renderPoints() {
    this.#pointList.element.innerHTML = '';

    const filteredPoints = filter[this.#currentFilterType](this.#allPoints);

    if (filteredPoints.length === 0) {
      const emptyView = new EmptyView({
        filterType: this.#currentFilterType
      });
      render(emptyView, this.#pointList.element);
      return;
    }

    this.#clearPointPresenters();

    filteredPoints.forEach((point) => {
      const pointPresenter = new PointPresenter({
        point,
        model: this.#pointModel,
        container: this.#pointList.element,
        onFormOpen: this.#handleFormOpen,
        onPointChange: this.#handlePointChange
      });
      pointPresenter.init();
      this.#pointPresenters.set(point.id, pointPresenter);
    });
  }

  #renderFilters() {
    const filters = generateFilters(this.#allPoints);

    const filterPresenter = new FilterView({
      filters: filters,
      currentFilterType: this.#currentFilterType,
      onFilterChange: this.#onFilterChange
    });
    render(filterPresenter, this.#filterContainer);
    filterPresenter.setFilterChangeHandler();
  }

  #onFilterChange = (filterType) => {
    this.#currentFilterType = filterType;
    this.#renderPoints();
  };

  #pointPresenters = new Map();

  #clearPointPresenters() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #handleFormOpen = () => {
    this.#resetAllForms();
  };

  #resetAllForms() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  }

  #handlePointChange = (updatedPoint) => {
    // Обновляем данные в массиве
    this.#allPoints = updateItem(this.#allPoints, updatedPoint);

    // Обновляем презентер
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };
}
