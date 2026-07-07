import { render } from '../framework/render.js';
import FilterView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import PointPresenter from './point-presenter.js';

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

    this.#allPoints.forEach((point) => {
      const pointPresenter = new PointPresenter(
        {
          point,
          model: this.#pointModel,
          container: this.#pointList.element
        }
      );
      pointPresenter.init();
    });
  }
}
