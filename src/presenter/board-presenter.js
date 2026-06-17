import { render } from '../framework/render.js';
import FilterView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import FormEditView from '../view/form-edit-view.js';
import PointView from '../view/point-view.js';

export default class BoardPresenter {
  #filterComponent = new FilterView();
  #sortComponent = new SortView();
  #pointList = new PointListView();

  #boardPoints = [];
  #filterContainer = null;
  #contentContainer = null;
  #pointModel = null;

  constructor({ filterContainer, contentContainer, pointModel }) {
    this.#filterContainer = filterContainer;
    this.#contentContainer = contentContainer;
    this.#pointModel = pointModel;
  }

  init() {
    this.#boardPoints = [...this.#pointModel.getPoints()];
    this.#renderBoard();
  }

  #renderBoard() {
    render(this.#filterComponent, this.#filterContainer);
    render(this.#sortComponent, this.#contentContainer);
    render(this.#pointList, this.#contentContainer);

    this.#renderPoints();
  }

  #renderPoints() {
    if (this.#boardPoints.length === 0) {
      return;
    }

    const pointListElement = this.#pointList.element;

    // Первая точка - форма редактирования
    const firstPoint = this.#boardPoints[0];
    const formView = new FormEditView({
      point: firstPoint,
      pointModel: this.#pointModel
    });
    render(formView, pointListElement);

    // Отрисовка остальных точек
    for (let i = 1; i < this.#boardPoints.length; i++) {
      const pointView = new PointView({
        pointData: this.#boardPoints[i],
        pointModel: this.#pointModel
      });
      render(pointView, pointListElement);
    }
  }
}
