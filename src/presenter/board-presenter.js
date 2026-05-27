import { render } from '../render.js';
import FilterView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';

const COUNT_POINT = 3;
export default class BoardPresenter {
  filterComponent = new FilterView();
  sortComponent = new SortView();
  pointList = new PointListView(COUNT_POINT);

  constructor({ filterContainer, contentContainer }) {
    this.filterContainer = filterContainer;
    this.contentContainer = contentContainer;
  }

  init() {
    render(this.filterComponent, this.filterContainer);
    render(this.sortComponent, this.contentContainer);
    render(this.pointList, this.contentContainer);
  }
}
