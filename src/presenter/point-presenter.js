import PointView from '../view/point/point-view.js';
import FormEditView from '../view/point/form-edit-view.js';
import { render, replace } from '../framework/render.js';
import {isEscape} from '../common/utils.js';

export default class PointPresenter{
  #pointModel = null;
  constructor({
    point,
    model,
    container
  }){
    this.point = point;
    this.#pointModel = model;
    this.container = container;
  }

  init(){
    this.pointView = new PointView({
      pointData: this.point,
      onEditClick: () => {
        this.#openForm(this.point, this.pointView);
        document.addEventListener('keydown', this.#onDocumentKeydown);
      },
      offers: this.#pointModel.getOffersByPoint(this.point),
      destinationName:  this.#pointModel.getDestinationByPoint(this.point).name
    });

    this.formView = new FormEditView({
      point: this.point,
      offers: this.#pointModel.getOffersByType(this.point)?.offers || [],
      destinationName: this.#pointModel.getDestinationByPoint(this.point)?.name || '',
      destinations: this.#pointModel.destinations,
      description: this.#pointModel.getDestinationByPoint(this.point)?.description || '',
      pictures: this.#pointModel.getDestinationByPoint(this.point)?.pictures || [],

      onSave: () => {
        this.#closeForm(this.formView, this.pointView);
        document.removeEventListener('keydown', this.#onDocumentKeydown);
      },
      onClose: () => {
        this.#closeForm(this.formView, this.pointView);
        document.removeEventListener('keydown', this.#onDocumentKeydown);
      }
    });

    this.#renderPoint();
  }

  #renderPoint() {
    render(this.pointView, this.container);
  }

  #openForm() {
    replace(this.formView, this.pointView);
  }

  #closeForm() {
    replace(this.pointView, this.formView);
  }

  #onDocumentKeydown = (evt) => {
    if (isEscape(evt)){
      this.#closeForm();
      document.removeEventListener('keydown', this.#onDocumentKeydown);
    }
  };
}
