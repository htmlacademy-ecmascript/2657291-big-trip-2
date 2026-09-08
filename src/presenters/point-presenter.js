import { remove, render, replace } from '../framework/render.js';
import PointView from '../views/point-view.js';
import { formatDate, getDuration } from '../utils/date.js';
import FormView from '../views/form-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import { TimeLimit } from '../const.js';

export default class PointPresenter {
  #pointListView;
  #pointView;
  #formView;
  #point;
  #destinationModel;
  #offersModel;
  #pointsModel;
  #onOpenForm;
  #onCloseForm;
  #uiBlocker;

  constructor({
    point,
    pointsModel,
    offersModel,
    destinationModel,
    pointListView,
    onOpenForm,
    onCloseForm,
  }) {
    this.#pointListView = pointListView;
    this.#point = point;
    this.#destinationModel = destinationModel;
    this.#offersModel = offersModel;
    this.#pointsModel = pointsModel;
    this.#onOpenForm = onOpenForm;
    this.#onCloseForm = onCloseForm;
    this.#uiBlocker = new UiBlocker({
      lowerLimit: TimeLimit.LOWER_LIMIT,
      upperLimit: TimeLimit.UPPER_LIMIT,
    });
  }

  init() {
    this.#pointView = new PointView({
      point: this.#getPointData(this.#point),
      onFavoriteChange: this.handleFavoriteChange,
      onOpenForm: this.handleOpenForm,
    });

    this.#formView = new FormView({
      point: this.#point,
      destinations: this.#destinationModel.destinations,
      availableOffers: this.#offersModel.getOffersByType(this.#point.type),
      onTypeChange: this.handleTypeChange,
      onCloseForm: this.handleCloseForm,
      onSubmit: this.handleSubmit,
      onDelete: this.handleDelete,
    });

    render(this.#pointView, this.#pointListView.element);
  }

  #getPointData(point) {
    return ({
      ...point,
      destination: this.#destinationModel.getDestinationNameById(point.destination),
      offers: this.#offersModel.getSelectedOffers(point.type, point.offers),
      date: formatDate(point.dateFrom, 'day-month'),
      timeFrom: formatDate(point.dateFrom, 'time'),
      timeTo: formatDate(point.dateTo, 'time'),
      duration: getDuration(point.dateFrom, point.dateTo),
    });
  }

  handleFavoriteChange = async () => {
    try {
      await this.#pointsModel.changePointFavorite(this.#point.id);
    } catch (error) {
      this.#pointView.shake();
    }
  };

  updatePoint() {
    this.#point = this.#pointsModel.getPointById(this.#point.id);
    this.#pointView.updateElement({ point: this.#getPointData(this.#point) });
  }

  destroy() {
    remove(this.#pointView);
    remove(this.#formView);
  }

  handleOpenForm = () => {
    this.#onOpenForm(this.#point.id);
  };

  handleCloseForm = () => {
    this.#onCloseForm();
  };

  openForm = () => {
    replace(this.#formView, this.#pointView);
  };

  closeForm = () => {
    replace(this.#pointView, this.#formView);
  };

  handleSubmit = async (pointData) => {
    this.#uiBlocker.block();
    try {
      await this.#pointsModel.updatePoint(pointData);
    } catch (error) {
      this.#formView.resetButtons();
      this.#formView.shake();
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  handleDelete = async (id) => {
    this.#uiBlocker.block();
    try {
      await this.#pointsModel.deletePoint(id);
    } catch (error) {
      this.#formView.resetButtons();
      this.#formView.shake();
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  handleTypeChange = (type) => this.#offersModel.getOffersByType(type);
}
