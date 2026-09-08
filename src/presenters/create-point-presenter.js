import { DEFAULT_FILTER, UpdateType, TimeLimit } from '../const.js';
import { remove, render, RenderPosition } from '../framework/render.js';
import CreateButtonView from '../views/create-button-view.js';
import FormView from '../views/form-view.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

export default class CreatePointPresenter {
  #createButtonView;
  #filterModel;
  #sortingModel;
  #appModel;
  #formView;
  #pointListView;
  #pointsModel;
  #destinationsModel;
  #offersModel;
  #uiBlocker;

  constructor({
    destinationModel,
    offersModel,
    pointsModel,
    filterModel,
    sortingModel,
    appModel,
    pointListView

  }) {
    this.#filterModel = filterModel;
    this.#sortingModel = sortingModel;
    this.#appModel = appModel;
    this.#pointListView = pointListView;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationModel;
    this.#offersModel = offersModel;

    this.#appModel.addObserver(this.#handleAppModelEvent);
    this.#uiBlocker = new UiBlocker({
      lowerLimit: TimeLimit.LOWER_LIMIT,
      upperLimit: TimeLimit.UPPER_LIMIT,
    });
  }

  init(elementContainer) {
    this.#createButtonView = new CreateButtonView({
      onClick: this.#onClickHandler,
      isDisabled: false,
    });
    render(this.#createButtonView, elementContainer);
  }

  #onClickHandler = async () => {
    this.#appModel.openCreateForm();
    await this.#filterModel.setFilter(UpdateType.MAJOR, DEFAULT_FILTER);
  };

  #openForm() {
    this.#formView = new FormView({
      point: null,
      destinations: this.#destinationsModel.destinations,
      availableOffers: this.#offersModel.getOffersByType('flight'),
      onTypeChange: this.#handleTypeChange,
      onCloseForm: this.#handleCloseForm,
      onSubmit: this.#handleSubmit,
    });
    render(this.#formView, this.#pointListView.element, RenderPosition.AFTERBEGIN);
  }

  #closeForm() {
    remove(this.#formView);
  }

  #handleSubmit = async (pointData) => {
    this.#uiBlocker.block();
    try {
      await this.#pointsModel.addPoint(pointData);
      this.#appModel.closeForm();
    } catch (error) {
      this.#formView.resetButtons();
      this.#formView.shake();
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleAppModelEvent = (type, data) => {
    const { closed, opened } = data;
    switch (type) {
      case 'OPEN':
        if (closed && closed.type === 'create') {
          this.#closeForm();
          this.#createButtonView.updateElement({ isDisabled: false });
        }

        if (opened.type === 'create') {
          this.#openForm();
          this.#createButtonView.updateElement({ isDisabled: true });
        }
        break;

      case 'CLOSE':
        if (closed && closed.type === 'create') {
          this.#closeForm();
          this.#createButtonView.updateElement({ isDisabled: false });
        }
        break;
    }
  };

  #handleCloseForm = () => {
    this.#appModel.closeForm();
  };

  #handleTypeChange = (type) => this.#offersModel.getOffersByType(type);
}
