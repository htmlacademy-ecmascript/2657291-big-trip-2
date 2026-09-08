import { FilterType, UpdateType } from '../const.js';
import { remove, render } from '../framework/render.js';
import { getFilteredPoints } from '../utils/filter-points.js';
import { getSortingPoints } from '../utils/sorting-points.js';
import EmptyView from '../views/empty-view.js';
import PointPresenter from './point-presenter.js';
import LoadingView from '../views/loading-view.js';

export default class PointsPresenter {
  #pointsModel = null;
  #offersModel = null;
  #destinationModel = null;
  #filterModel = null;
  #sortingModel = null;
  #appModel = null;

  #pointListView = null;
  #emptyView = null;
  #loadingView = null;

  #pointPresenters = new Map();

  constructor({
    pointsModel,
    offersModel,
    destinationModel,
    filterModel,
    sortingModel,
    appModel,
    pointListView
  }) {
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationModel = destinationModel;
    this.#filterModel = filterModel;
    this.#sortingModel = sortingModel;
    this.#appModel = appModel;
    this.#pointListView = pointListView;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
    this.#sortingModel.addObserver(this.#handleModelEvent);

    this.#appModel.addObserver(this.#handleFormEvent);
  }

  init(containerElement) {
    render(this.#pointListView, containerElement);
    this.#renderLoading();
  }

  #renderLoading() {
    this.#loadingView = new LoadingView();
    render(this.#loadingView, this.#pointListView.element);
  }

  #getPoints() {
    const filteredPoints = getFilteredPoints[this.#filterModel.filter](this.#pointsModel.points);
    return getSortingPoints[this.#sortingModel.sortType](filteredPoints);
  }

  #renderList() {
    const points = this.#getPoints();

    if (this.#pointsModel.isLoading) {
      this.#renderLoading();
      return;
    }

    if (!points.length) {
      this.#renderEmptyList();
      return;
    }
    points.forEach((point) => {
      this.#renderPoint(point);
    });
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      point,
      pointsModel: this.#pointsModel,
      offersModel: this.#offersModel,
      destinationModel: this.#destinationModel,
      pointListView: this.#pointListView,
      onOpenForm: this.#handleOpenForm,
      onCloseForm: this.#handleCloseForm,
    });

    pointPresenter.init();
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderEmptyList() {
    this.#emptyView = new EmptyView({
      filterType: this.#filterModel.filter ?? FilterType.EVERYTHING,
      isError: this.#pointsModel.isLoadingFailed,
    });
    render(this.#emptyView, this.#pointListView.element);
  }

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.INIT:
        this.#clearList();
        this.#renderList();
        break;
      case UpdateType.PATCH: {
        const presenter = this.#pointPresenters.get(data.id);
        if (presenter) {
          presenter.updatePoint(data);
        }
        break;
      }

      case UpdateType.MINOR:
      case UpdateType.MAJOR:
        this.#clearList();
        this.#renderList();
        break;
    }
  };

  #handleOpenForm = (id) => {
    this.#appModel.openEditForm(id);
  };

  #handleCloseForm = () => {
    this.#appModel.closeForm();
  };

  #handleFormEvent = (type, data) => {
    const { closed, opened } = data;
    switch (type) {
      case 'OPEN':
        if (closed && closed.type === 'edit') {
          const closedPresenter = this.#pointPresenters.get(closed.id);
          if (closedPresenter) {
            closedPresenter.closeForm();
          }
        }

        if (opened.type === 'edit') {
          const openedPresenter = this.#pointPresenters.get(opened.id);
          if (openedPresenter) {
            openedPresenter.openForm();
          }
        }
        break;

      case 'CLOSE':
        if (closed && closed.type === 'edit') {
          const closedPresenter = this.#pointPresenters.get(closed.id);
          if (closedPresenter) {
            closedPresenter.closeForm();
          }
        }
        break;
    }
  };

  #clearList() {
    this.#pointPresenters.forEach((presenter) => {
      presenter.destroy();
    });

    this.#pointPresenters.clear();

    if (this.#emptyView) {
      remove(this.#emptyView);
      this.#emptyView = null;
    }

    if (this.#loadingView) {
      remove(this.#loadingView);
      this.#loadingView = null;
    }
  }
}
