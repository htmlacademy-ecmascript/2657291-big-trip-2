import { render } from '../framework/render.js';
import { isEscape } from '../common/utils.js';
import FormEditView from '../view/point/form-edit-view.js';

export default class NewPointPresenter {
  #container = null;
  #formView = null;
  #newEventButton = null;
  #destinations = null;
  #allOffers = null;
  #onNewPointOpen = null;
  #onNewPointSave = null;

  constructor({ container, newEventButton, destinations, allOffers, onNewPointOpen, onNewPointSave }) {
    this.#container = container;
    this.#newEventButton = newEventButton;
    this.#destinations = destinations;
    this.#allOffers = allOffers;
    this.#onNewPointOpen = onNewPointOpen;
    this.#onNewPointSave = onNewPointSave;
  }

  open() {
    if (this.#formView) {
      return;
    }

    if (this.#newEventButton) {
      this.#newEventButton.disabled = true;
    }

    this.#onNewPointOpen();

    const defaultPoint = {
      id: crypto.randomUUID(),
      type: 'flight',
      basePrice: 0,
      dateFrom: new Date().toISOString(),
      dateTo: new Date().toISOString(),
      destination: '',
      offers: [],
      isFavorite: false,
    };

    this.#formView = new FormEditView({
      point: defaultPoint,
      offers: [],
      destinationName: '',
      description: '',
      pictures: [],
      destinations: this.#destinations,
      allOffers: this.#allOffers,
      onSave: (pointData) => this.#handleSave(pointData),
      onClose: () => this.#closeForm(),
      isNew: true,
      onCreate: (pointData) => {
        this.#handleSave(pointData);
      },
    });

    render(this.#formView, this.#container, 'afterbegin');

    document.addEventListener('keydown', this.#onEscKeydown);
  }


  #closeForm() {
    if (this.#formView) {
      this.#formView.element.remove();
      this.#formView = null;
      document.removeEventListener('keydown', this.#onEscKeydown);
    }

    if (this.#newEventButton) {
      this.#newEventButton.disabled = false;
    }
  }

  #onEscKeydown = (evt) => {
    if (isEscape(evt)) {
      evt.preventDefault();
      this.#closeForm();
    }
  };

  get isOpen() {
    return this.#formView !== null;
  }

  #handleSave(pointData) {
    this.#closeForm();
    this.#onNewPointSave(pointData);
  }
}
