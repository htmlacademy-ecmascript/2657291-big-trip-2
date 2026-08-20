import { render, remove } from '../framework/render.js';
import { isEscape, shake } from '../common/utils.js';
import NewPointView from '../view/point/new-point-view.js';

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

    const firstDestinationId = this.#destinations && this.#destinations.length > 0
      ? this.#destinations[0].id
      : '';

    const defaultPoint = {
      basePrice: 0,
      dateFrom: new Date(),
      dateTo: new Date(),
      destination: firstDestinationId,
      isFavorite: false,
      offers: [],
      type: 'flight',
    };

    this.#formView = new NewPointView({
      point: defaultPoint,
      destinations: this.#destinations,
      allOffers: this.#allOffers,
      onSave: this.#handleSave,
      onClose: this.#handleClose,
    });

    render(this.#formView, this.#container.element, 'afterbegin');
    this.#formView._restoreHandlers();
    document.addEventListener('keydown', this.#onEscKeydown);
  }

  #closeForm() {
    if (this.#formView) {
      remove(this.#formView);
      this.#formView = null;
    }

    if (this.#newEventButton) {
      this.#newEventButton.disabled = false;
    }

    document.removeEventListener('keydown', this.#onEscKeydown);
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

  #handleSave = (pointData) => {
    this.setSaving();
    this.#onNewPointSave(pointData);
  };

  #handleClose = () => {
    this.#closeForm();
  };

  close() {
    this.#closeForm();
  }

  setSaving() {
    if (this.#formView) {
      this.#formView.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  resetForm() {
    if (this.#formView) {
      this.#formView.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    }
  }

  setAborting() {
    if (!this.#formView) {
      return;
    }

    const resetFormState = () => {
      this.#formView.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    shake(this.#formView.element, resetFormState);
  }
}
