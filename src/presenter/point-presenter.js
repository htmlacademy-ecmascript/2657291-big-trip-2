import PointView from '../view/point/point-view.js';
import FormEditView from '../view/point/form-edit-view.js';
import { render, replace } from '../framework/render.js';
import {isEscape} from '../common/utils.js';
import { Mode } from '../const.js';
export default class PointPresenter{
  #point = null;
  #pointModel = null;
  #container = null;
  #onPointChange = null;
  #onFormOpen = null;
  #pointView = null;
  #formView = null;
  #mode = Mode.DEFAULT;
  #onDelete = null;

  constructor({point, model, container, onPointChange, onFormOpen, onDelete}) {
    this.#point = point;
    this.#pointModel = model;
    this.#container = container;
    this.#onPointChange = onPointChange;
    this.#onFormOpen = onFormOpen;
    this.#onDelete = onDelete;
  }

  init(updatedPoint) {
    if (updatedPoint) {
      this.#point = updatedPoint;
    }

    const oldPointView = this.#pointView;
    const oldFormView = this.#formView;

    // Создаём новые вьюхи с обновлёнными данными
    this.#createViews();

    // Если была открыта форма — закрываем её
    if (this.#mode === Mode.EDITING) {
      this.#closeForm();
    }

    // Заменяем старую точку новой на том же месте
    if (oldPointView?.element?.parentElement) {
      replace(this.#pointView, oldPointView);
      oldPointView.removeElement();
    } else {
      render(this.#pointView, this.#container);
    }

    // Удаляем старую форму, если она была в DOM
    if (oldFormView?.element?.parentElement) {
      oldFormView.removeElement();
    }
  }

  #createViews() {
    this.#pointView = new PointView({
      pointData: this.#point,
      onEditClick: () => {
        this.#openForm();
      },
      offers: this.#pointModel.getOffersByPoint(this.#point),
      destinationName: this.#pointModel.getDestinationByPoint(this.#point)?.name || '',
      onFavoriteClick: () => {
        const updatedPoint = {
          ...this.#point,
          isFavorite: !this.#point.isFavorite
        };
        this.#onPointChange(updatedPoint);
      }
    });

    this.#formView = new FormEditView({
      point: this.#point,
      offers: this.#pointModel.getOffersByType(this.#point)?.offers || [],
      destinationName: this.#pointModel.getDestinationByPoint(this.#point)?.name || '',
      destinations: this.#pointModel.destinations,
      description: this.#pointModel.getDestinationByPoint(this.#point)?.description || '',
      pictures: this.#pointModel.getDestinationByPoint(this.#point)?.pictures || [],
      pointModel: this.#pointModel,

      onSave: (updatedPoint) => {
        this.#closeForm();
        this.#onPointChange(updatedPoint);

      },
      onClose: () => {
        this.#closeForm();
      },
      onDelete: this.#handleDelete,
    });
  }

  #renderPoint() {
    render(this.#pointView, this.#container);
  }

  #openForm() {
    if (this.#onFormOpen) {
      this.#onFormOpen();
    }

    replace(this.#formView, this.#pointView);

    this.#mode = Mode.EDITING;

    document.addEventListener('keydown', this.#onDocumentKeydown);
  }


  #closeForm() {
    replace(this.#pointView, this.#formView);
    this.#mode = Mode.DEFAULT;
    document.removeEventListener('keydown', this.#onDocumentKeydown);
  }

  #onDocumentKeydown = (evt) => {
    if (isEscape(evt)){
      this.#closeForm();
      document.removeEventListener('keydown', this.#onDocumentKeydown);
    }
  };

  #recreateViews() {
    this.#pointView.element?.remove();
    this.#formView.element?.remove();

    this.#createViews();
  }


  resetView() {
    if (this.#mode === Mode.EDITING) {
      this.#closeForm();
    }
  }

  destroy() {
    this.#pointView.element?.remove();
    this.#formView.element?.remove();
    document.removeEventListener('keydown', this.#onDocumentKeydown);
  }

  #handleDelete = () => {
    this.#onDelete(this.#point.id);
  };
}
