import { render } from '../render.js';
import FilterView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import FormEditView from '../view/form-edit-view.js';
import PointView from '../view/point-view.js';
import PointModel from '../model/points-model.js';
export default class BoardPresenter {
  filterComponent = new FilterView();
  sortComponent = new SortView();
  pointList = new PointListView();
  editPoint = null;

  constructor({ filterContainer, contentContainer, pointModel }) {
    this.filterContainer = filterContainer;
    this.contentContainer = contentContainer;
    this.pointModel = pointModel;
  }

  init() {
    const points = this.pointModel.getPoints();
    const offers = this.pointModel.getOffers();
    const destinations = this.pointModel.getDestinations();

    render(this.filterComponent, this.filterContainer);
    render(this.sortComponent, this.contentContainer);
    render(this.pointList, this.contentContainer);

    const firstPoint = points[0];
    this.editPoint = new FormEditView(firstPoint, destinations, offers);
    render(this.editPoint, this.pointList.getElement());

    for (let i = 0; i < points.length; i++) {
      render(new PointView(points[i], destinations, offers), this.pointList.getElement());
    }
  }
}
