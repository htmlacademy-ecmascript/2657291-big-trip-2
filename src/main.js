import BoardPresenter from './presenter/board-presenter';
import PointModel from './model/points-model';
import FilterModel from './model/filter-model';
import FilterPresenter from './presenter/filter-presenter';
import PointsApiService from './points-api-service.js';

const AUTHORIZATION = `Basic ${crypto.randomUUID()}`;
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

const filterContainer = document.querySelector('.trip-controls__filters');
const contentContainer = document.querySelector('.trip-events');

const pointModel = new PointModel({
  pointsApiService: new PointsApiService(END_POINT, AUTHORIZATION)
});

//const pointModel = new PointModel();

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

pointModel.init();
