import { render } from '../render.js';
import FilterView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import FormEditView from '../view/form-edit-view.js';
import PointView from '../view/point-view.js';
import { COUNT_POINT } from '../const.js';
export default class BoardPresenter {
  filterComponent = new FilterView();
  sortComponent = new SortView();
  pointList = new PointListView();
  editPoint = new FormEditView();

  constructor({ filterContainer, contentContainer }) {
    this.filterContainer = filterContainer;
    this.contentContainer = contentContainer;
  }

  init() {
    render(this.filterComponent, this.filterContainer);
    render(this.sortComponent, this.contentContainer);
    render(this.pointList, this.contentContainer);
    render(this.editPoint, this.pointList.getElement());

    for (let i = 1; i < COUNT_POINT; i++) {
      render(new PointView, this.pointList.getElement());
    }
  }
}
