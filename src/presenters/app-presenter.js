import DestinationsApiService from '../api/destinations-api.js';
import OffersApiService from '../api/offers-api.js';
import PointsApiService from '../api/points-api.js';

import { AUTHORIZATION, SERVER } from '../const.js';
import DestinationsModel from '../models/destinations-model.js';
import OffersModel from '../models/offers-model.js';
import PointsModel from '../models/points-model.js';
import FilterModel from '../models/filter-model.js';
import CreatePointPresenter from './create-point-presenter.js';
import FilterPresenter from './filter-presenter.js';
import PointsPresenter from './points-presenter.js';
import SortingPresenter from './sorting-presenter.js';
import SortingModel from '../models/sorting-model.js';
import TripInfoPresenter from './trip-info-presenter.js';
import AppModel from '../models/app-model.js';
import PointListView from '../views/point-list-view.js';

const filtersElement = document.querySelector('.trip-controls__filters');
const eventsElement = document.querySelector('.trip-events');
const tripMainElement = document.querySelector('.trip-main');
const tripInfoElement = tripMainElement.querySelector('.trip-main__trip-info');

export default class AppPresenter {
  #pointsModel = null;
  #offersModel = null;
  #destinationsModel = null;

  #filterModel = null;
  #sortingModel = null;

  #pointsPresenter = null;
  #filterPresenter = null;
  #sortingPresenter = null;
  #createPointPresenter = null;
  #tripInfoPresenter = null;
  #appModel = null;

  init() {
    const pointsApiService = new PointsApiService(SERVER, AUTHORIZATION);
    const offersApiService = new OffersApiService(SERVER, AUTHORIZATION);
    const destinationsApiService = new DestinationsApiService(SERVER, AUTHORIZATION);

    this.#pointsModel = new PointsModel(pointsApiService);
    this.#offersModel = new OffersModel(offersApiService);
    this.#destinationsModel = new DestinationsModel(destinationsApiService);
    this.#filterModel = new FilterModel();
    this.#sortingModel = new SortingModel();
    this.#appModel = new AppModel();

    this.#initPresenters();
    this.#loadData();
  }

  #initPresenters() {
    this.#filterPresenter = new FilterPresenter({
      filterModel: this.#filterModel,
      pointsModel: this.#pointsModel,
    });

    this.#sortingPresenter = new SortingPresenter({
      sortingModel: this.#sortingModel,
      filterModel: this.#filterModel,
    });

    const pointListView = new PointListView();

    this.#pointsPresenter = new PointsPresenter({
      pointsModel: this.#pointsModel,
      offersModel: this.#offersModel,
      destinationModel: this.#destinationsModel,
      filterModel: this.#filterModel,
      sortingModel: this.#sortingModel,
      appModel: this.#appModel,
      pointListView,
    });

    this.#createPointPresenter = new CreatePointPresenter({
      pointsModel: this.#pointsModel,
      offersModel: this.#offersModel,
      destinationModel: this.#destinationsModel,
      filterModel: this.#filterModel,
      sortingModel: this.#sortingModel,
      appModel: this.#appModel,
      pointListView,
    });

    if (tripInfoElement) {
      this.#tripInfoPresenter = new TripInfoPresenter({
        pointsModel: this.#pointsModel,
        offersModel: this.#offersModel,
        destinationsModel: this.#destinationsModel,
        container: tripInfoElement,
      });
      this.#tripInfoPresenter.init();
    }

    this.#filterPresenter.init(filtersElement);
    this.#sortingPresenter.init(eventsElement);
    this.#createPointPresenter.init(tripMainElement);
    this.#pointsPresenter.init(eventsElement);
    this.#appModel.addObserver(this.#handleFormEvent);
  }

  async #loadData() {
    await Promise.all([
      this.#offersModel.init(),
      this.#destinationsModel.init(),
    ]);
    await this.#pointsModel.init();
  }

  #handleFormEvent = () => {
    if (this.#appModel.openedForm) {
      document.addEventListener('keydown', this.#handleDocumentKeydown);
    } else {
      document.removeEventListener('keydown', this.#handleDocumentKeydown);
    }
  };

  #handleDocumentKeydown = (evt) => {
    if (evt.key !== 'Escape') {
      return;
    }
    this.#appModel.closeForm();
  };
}
