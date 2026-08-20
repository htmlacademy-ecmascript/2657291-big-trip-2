import { render, replace, remove, RenderPosition } from '../framework/render.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import PointPresenter from './point-presenter.js';
import { filter } from '../common/filter.js';
import EmptyView from '../view/empty-view.js';
import { UserAction, UpdateType, FilterType, TimeLimit } from '../const.js';
import NewPointPresenter from './new-point-presenter.js';
import LoadingView from '../view/loading-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

export default class BoardPresenter {
  #sortComponent = null;
  #pointList = new PointListView();
  #loadingComponent = new LoadingView();
  #currentSortType = 'day';
  #filterContainer = null;
  #contentContainer = null;
  #pointModel = null;
  #filterModel = null;
  #pointPresenters = new Map();
  #newPointPresenter = null;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  #handleNewPointOpen = () => {
    this.#resetAllForms();

    // Сбрасываем фильтр на Everything
    this.#filterModel.setFilter(UpdateType.MINOR, FilterType.EVERYTHING);

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
        this.renderPoints();
        break;

      case UpdateType.MAJOR:
        this.#newPointPresenter.close();
        this.resetSort();
        this.renderPoints();
        break;

      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderBoard();
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

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#pointModel.updatePoint(updateType, update);
        } catch {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;

      case UserAction.ADD_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#pointModel.addPoint(updateType, update);
        } catch {
          this.#newPointPresenter.setAborting();
        }
        break;

      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#pointModel.deletePoint(updateType, update);
        } catch {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
    }

    this.#uiBlocker.unblock();
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
      container: this.#pointList,
      newEventButton: document.querySelector('.trip-main__event-add-btn'),
      destinations: this.#pointModel.destinations,
      allOffers: this.#pointModel.offers,
      onNewPointOpen: this.#handleNewPointOpen,
      onNewPointSave: this.#handleNewPointSave,
    });
  }

  init() {
    this.#renderLoading();
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
        onViewAction: this.#handleViewAction.bind(this),
      });
      pointPresenter.init();
      this.#pointPresenters.set(point.id, pointPresenter);
    });
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#contentContainer, RenderPosition.AFTERBEGIN);
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
