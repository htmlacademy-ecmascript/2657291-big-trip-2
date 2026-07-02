import { render, replace } from '../framework/render.js';
import FilterView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import FormEditView from '../view/form-edit-view.js';
import PointView from '../view/point-view.js';

export default class BoardPresenter {
  #filterComponent = new FilterView();
  #sortComponent = new SortView();
  #pointList = new PointListView();

  #allPoints = [];
  #filterContainer = null;
  #contentContainer = null;
  #pointModel = null;

  constructor({ filterContainer, contentContainer, pointModel }) {
    this.#filterContainer = filterContainer;
    this.#contentContainer = contentContainer;
    this.#pointModel = pointModel;
  }

  init() {
    this.#allPoints = [...this.#pointModel.points];
    this.#renderBoard();
  }

  #renderBoard() {
    render(this.#filterComponent, this.#filterContainer);
    render(this.#sortComponent, this.#contentContainer);
    render(this.#pointList, this.#contentContainer);

    this.#renderPoints();
  }

  #renderPoints() {
    if (this.#allPoints.length === 0) {
      return;
    }

    const pointListElement = this.#pointList.element;

    this.#allPoints.forEach((point) => {
      this.#renderPoint(point, pointListElement);
    });
  }

  #renderPoint(point, container) {
    const pointView = new PointView({
      pointData: point,
      pointModel: this.#pointModel,
      onEditClick: () => this.#replacePointToForm(point, pointView)
    });

    render(pointView, container);
    pointView.setEditClickHandler();
  }

  #replacePointToForm(point, pointView) {
    const formView = new FormEditView({
      point: point,
      pointModel: this.#pointModel,
      onSave: () => this.#replaceFormToPoint(formView, pointView),
      onClose: () => this.#replaceFormToPoint(formView, pointView)
    });

    replace(formView, pointView);
    formView.setSaveHandler();
    formView.setCloseHandler();
  }

  #replaceFormToPoint(formView, pointView) {
    replace(pointView, formView);
    pointView.setEditClickHandler();
    formView.removeElement();
  }
}
