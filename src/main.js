import BoardPresenter from './presenter/board-presenter';

const filterContainer = document.querySelector('.trip-controls__filters');
const contentContainer = document.querySelector('.trip-events');

const presenter = new BoardPresenter({ filterContainer, contentContainer });
presenter.init();

