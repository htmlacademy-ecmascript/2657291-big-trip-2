import BoardPresenter from './presenter/board-presenter';
import PointModel from './model/points-model';
import FilterModel from './model/filter-model';
import FilterPresenter from './presenter/filter-presenter';

const filterContainer = document.querySelector('.trip-controls__filters');
const contentContainer = document.querySelector('.trip-events');

const pointModel = new PointModel();
const filterModel = new FilterModel();

const presenter = new BoardPresenter({
  filterContainer,
  contentContainer,
  pointModel,
  filterModel,
});
presenter.init();

const filterPresenter = new FilterPresenter({
  filterContainer,
  filterModel,
  pointModel,
});
filterPresenter.init();

const newEventButton = document.querySelector('.trip-main__event-add-btn');
if (newEventButton) {
  newEventButton.addEventListener('click', () => {
    presenter.createNewPoint();
  });
}
