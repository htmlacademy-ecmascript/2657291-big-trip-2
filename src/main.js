import BoardPresenter from './presenter/board-presenter';
import PointModel from './model/points-model';

const filterContainer = document.querySelector('.trip-controls__filters');
const contentContainer = document.querySelector('.trip-events');


const pointModel = new PointModel();
pointModel.init();

const presenter = new BoardPresenter({ filterContainer, contentContainer, pointModel });
presenter.init();

