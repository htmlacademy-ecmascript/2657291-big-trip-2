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
  #sortComponent = null;
  #pointList = new PointListView();
  #allPoints = [];
  #sourcedPoints = [];
  #currentSortType = 'day';
  #filterContainer = null;
  #contentContainer = null;
  #pointModel = null;
  #currentFilterType = FilterType.EVERYTHING;
  #pointPresenters = new Map();

  constructor({ filterContainer, contentContainer, pointModel }) {
    this.#filterContainer = filterContainer;
    this.#contentContainer = contentContainer;
    this.#pointModel = pointModel;
  }

  init() {
    this.#allPoints = [...this.#pointModel.points];
    this.#sourcedPoints = [...this.#pointModel.points];
    this.#renderBoard();
    this.#renderFilters();
  }

  #sortPoints(sortType) {
    switch (sortType) {
      case 'price':
        this.#allPoints.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'time':
        this.#allPoints.sort((a, b) => {
          const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
          return durationB - durationA;
        });
        break;
      case 'day':
      default:
        this.#allPoints = [...this.#sourcedPoints];
        break;
    }
    this.#currentSortType = sortType;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortPoints(sortType);
    this.#renderPoints();
  };

  #renderSort() {
    this.#sortComponent = new SortView({
      onSortChange: this.#handleSortTypeChange,
      currentSortType: this.#currentSortType
    });
    render(this.#sortComponent, this.#contentContainer);
  }

  #renderBoard() {
    this.#renderSort();
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
