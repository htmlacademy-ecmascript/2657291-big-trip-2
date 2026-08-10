import { render, replace } from '../framework/render.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import PointPresenter from './point-presenter.js';
import { filter } from '../common/filter.js';
import EmptyView from '../view/empty-view.js';
import { UserAction, UpdateType, FilterType } from '../const.js';
import NewPointPresenter from './new-point-presenter.js';

export default class BoardPresenter {
  #sortComponent = null;
  #pointList = new PointListView();
  #currentSortType = 'day';
  #filterContainer = null;
  #contentContainer = null;
  #pointModel = null;
  #filterModel = null;
  #pointPresenters = new Map();
  #newPointPresenter = null;

  #handleNewPointOpen = () => {
    this.#resetAllForms();

    // Сбрасываем фильтр на Everything
    this.#filterModel.setFilter(UpdateType.PATCH, FilterType.EVERYTHING);

    // Сбрасываем сортировку на Day
    this.#currentSortType = 'day';
    this.#updateSort();
  };

  #handleNewPointSave = (pointData) => {
    // Добавляем новую точку
    this.#handleViewAction(UserAction.ADD_POINT, UpdateType.MINOR, pointData);
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id)?.init(data);
        break;
      case UpdateType.MINOR:
        if (data?.id) {
          const presenter = this.#pointPresenters.get(data.id);
          if (presenter) {
            presenter.init(data);
          } else {
            this.renderPoints();
          }
        } else {
          this.renderPoints();
        }
        break;
      case UpdateType.MAJOR:
        this.resetSort();
        this.renderPoints();
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#updateSort();
    this.renderPoints();
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointModel.deletePoint(updateType, update.id);
        break;
    }
  };

  #handleFormOpen = () => {
    if (this.#newPointPresenter.isOpen) {
      return false;
    }
    this.#resetAllForms();
    return true;
  };

  constructor({ filterContainer, contentContainer, pointModel, filterModel }) {
    this.#filterContainer = filterContainer;
    this.#contentContainer = contentContainer;
    this.#pointModel = pointModel;
    this.#filterModel = filterModel;
    this.#pointModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);

    this.#newPointPresenter = new NewPointPresenter({
      container: this.#pointList.element,
      newEventButton: document.querySelector('.trip-main__event-add-btn'),
      destinations: this.#pointModel.destinations,
      allOffers: this.#pointModel.offers,
      onNewPointOpen: this.#handleNewPointOpen,
      onNewPointSave: this.#handleNewPointSave,
    });
  }

  init() {
    this.#renderBoard();
  }

  get points() {
    const allPoints = this.#pointModel.points;
    const currentFilter = this.#filterModel.filter;
    const filterFn = filter[currentFilter];
    const filtered = typeof filterFn === 'function' ? filterFn(allPoints) : allPoints;

    switch (this.#currentSortType) {
      case 'price':
        return [...filtered].sort((a, b) => b.basePrice - a.basePrice);
      case 'time':
        return [...filtered].sort((a, b) => {
          const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
          return durationB - durationA;
        });
      case 'day':
      default:
        return filtered;
    }
  }

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
    this.renderPoints();
  }

  renderPoints() {
    this.#pointList.element.innerHTML = '';
    const points = this.points;

    if (points.length === 0) {
      const emptyView = new EmptyView({
        filterType: this.#filterModel.filter
      });
      render(emptyView, this.#pointList.element);
      return;
    }

    this.#clearPointPresenters();

    points.forEach((point) => {
      const pointPresenter = new PointPresenter({
        point,
        model: this.#pointModel,
        container: this.#pointList.element,
        onFormOpen: this.#handleFormOpen,
        onViewAction: this.#handleViewAction,
      });
      pointPresenter.init();
      this.#pointPresenters.set(point.id, pointPresenter);
    });
  }

  #clearPointPresenters() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #resetAllForms() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  }

  #updateSort() {
    const newSortComponent = new SortView({
      onSortChange: this.#handleSortTypeChange,
      currentSortType: this.#currentSortType
    });

    if (this.#sortComponent) {
      replace(newSortComponent, this.#sortComponent);
    } else {
      render(newSortComponent, this.#contentContainer);
    }

    this.#sortComponent = newSortComponent;
  }

  resetSort() {
    this.#currentSortType = 'day';
    this.#updateSort();
  }

  createNewPoint() {
    this.#newPointPresenter.open();
  }
}
