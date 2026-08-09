import PointView from '../view/point/point-view.js';
import FormEditView from '../view/point/form-edit-view.js';
import { render, replace } from '../framework/render.js';
import { isEscape, isDatesEqual } from '../common/utils.js';
import { Mode, UserAction, UpdateType } from '../const.js';

export default class PointPresenter {
  #point = null;
  #pointModel = null;
  #container = null;
  #onViewAction = null;
  #onFormOpen = null;
  #pointView = null;
  #formView = null;
  #mode = Mode.DEFAULT;

  constructor({ point, model, container, onViewAction, onFormOpen }) {
    this.#point = point;
    this.#pointModel = model;
    this.#container = container;
    this.#onViewAction = onViewAction;
    this.#onFormOpen = onFormOpen;
  }

  init(updatedPoint) {
    if (updatedPoint) {
      this.#point = updatedPoint;
    }

    const oldPointView = this.#pointView;
    const oldFormView = this.#formView;

    this.#createViews();

    if (this.#mode === Mode.EDITING) {
      this.#closeForm();
    }

    if (oldPointView?.element?.parentElement) {
      replace(this.#pointView, oldPointView);
      oldPointView.removeElement();
    } else {
      render(this.#pointView, this.#container);
    }

    if (oldFormView?.element?.parentElement) {
      oldFormView.removeElement();
    }
  }

  #createViews() {
    this.#pointView = new PointView({
      pointData: this.#point,
      onEditClick: () => this.#openForm(),
      offers: this.#pointModel.getOffersByPoint(this.#point),
      destinationName: this.#pointModel.getDestinationByPoint(this.#point)?.name || '',
      onFavoriteClick: () => {
        this.#onViewAction(
          UserAction.UPDATE_POINT,
          UpdateType.MINOR,
          { ...this.#point, isFavorite: !this.#point.isFavorite }
        );
      }
    });

    const offersForForm = this.#pointModel.getOffersByType(this.#point) || [];

    this.#formView = new FormEditView({
      point: this.#point,
      offers: offersForForm,
      destinationName: this.#pointModel.getDestinationByPoint(this.#point)?.name || '',
      destinations: this.#pointModel.destinations || [],
      description: this.#pointModel.getDestinationByPoint(this.#point)?.description || '',
      pictures: this.#pointModel.getDestinationByPoint(this.#point)?.pictures || [],
      //pointModel: this.#pointModel,
      allOffers: this.#pointModel.offers,

      onSave: (updatedPoint) => {
        this.#closeForm();

        const isMinorUpdate =
        !isDatesEqual(this.#point.dateFrom, updatedPoint.dateFrom) ||
        !isDatesEqual(this.#point.dateTo, updatedPoint.dateTo) ||
        this.#point.destination !== updatedPoint.destination;

        this.#onViewAction(
          UserAction.UPDATE_POINT,
          isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
          updatedPoint,
        );
      },

      onClose: () => this.#closeForm(),

      onDelete: () => {
        this.#onViewAction(UserAction.DELETE_POINT, UpdateType.MINOR, { id: this.#point.id });
      },
    });
  }

  #openForm() {
    if (this.#onFormOpen) {
      this.#onFormOpen();
    }

    if (this.#pointView?.element?.parentElement) {
      replace(this.#formView, this.#pointView);
    } else {
      render(this.#formView, this.#container);
    }

    this.#formView._restoreHandlers();
    this.#mode = Mode.EDITING;
    document.addEventListener('keydown', this.#onDocumentKeydown);
  }

  #closeForm() {
    if (this.#formView?.element?.parentElement) {
      replace(this.#pointView, this.#formView);
    } else {
      render(this.#pointView, this.#container);
    }

    this.#mode = Mode.DEFAULT;
    document.removeEventListener('keydown', this.#onDocumentKeydown);
  }

  resetView() {
    if (this.#mode === Mode.EDITING) {
      this.#closeForm();
    }
  }

  destroy() {
    this.#pointView?.element?.remove();
    this.#formView?.element?.remove();
    document.removeEventListener('keydown', this.#onDocumentKeydown);
  }

  #onDocumentKeydown = (evt) => {
    if (isEscape(evt)) {
      evt.preventDefault();
      this.#closeForm();
    }
  };
}
