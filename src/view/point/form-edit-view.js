import he from 'he';
import { POINTS_TYPES } from '../../const';
import AbstractStatefulView from '../../framework/view/abstract-stateful-view.js';
import { formatDateForInput } from '../../common/utils.js';
//import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';


function createTemplate(point, offers, destinationName, destinations, description, pictures, isNew, uid, isDisabled, isSaving, isDeleting) {
  const safeDestinations = Array.isArray(destinations) ? destinations : [];
  const safeOffers = Array.isArray(offers) ? offers : [];
  const safePictures = Array.isArray(pictures) ? pictures : [];

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-${uid}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-${uid}" type="checkbox" ${isDisabled ? 'disabled' : ''}>
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${POINTS_TYPES.map((type) => `
                  <div class="event__type-item">
                    <input id="event-type-${type}-${uid}" class="event__type-input visually-hidden"
                           type="radio" name="event-type" value="${type}" ${point.type === type ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
                    <label class="event__type-label event__type-label--${type}" for="event-type-${type}-${uid}">
                      ${[...type][0].toUpperCase() + [...type].slice(1).join('')}
                    </label>
                  </div>`).join('')}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-${uid}">${point.type}</label>
            <input class="event__input event__input--destination" id="event-destination-${uid}" type="text"
                   name="event-destination" value="${he.encode(destinationName || '')}" list="destination-list-${uid}" ${isDisabled ? 'disabled' : ''}>
            <datalist id="destination-list-${uid}">
              ${safeDestinations.map((d) => `<option value="${he.encode(d.name)}"></option>`).join('')}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${uid}">From</label>
            <input class="event__input event__input--time" id="event-start-time-${uid}" type="text"
                   name="event-start-time" value="${formatDateForInput(point.dateFrom)}" ${isDisabled ? 'disabled' : ''}>
            &mdash;
            <label class="visually-hidden" for="event-end-time-${uid}">To</label>
            <input class="event__input event__input--time" id="event-end-time-${uid}" type="text"
                   name="event-end-time" value="${formatDateForInput(point.dateTo)}" ${isDisabled ? 'disabled' : ''}>
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-${uid}"><span class="visually-hidden">Price</span>&euro;</label>
            <input class="event__input event__input--price" id="event-price-${uid}" type="text" name="event-price"
                   value="${point.basePrice}" ${isDisabled ? 'disabled' : ''}>
          </div>

          <button class="event__save-btn btn btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>
            ${isSaving ? 'Saving...' : 'Save'}
          </button>
          ${isNew ? `<button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}>Cancel</button>`
    : `<button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''}>${isDeleting ? 'Deleting...' : 'Delete'}</button>`}
          <button class="event__rollup-btn" type="button" ${isDisabled ? 'disabled' : ''}>
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${safeOffers.map((offer) => `
                <div class="event__offer-selector">
                  <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}-${uid}" type="checkbox"
                         name="${offer.id}" ${point.offers.includes(offer.id) ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
                  <label class="event__offer-label" for="event-offer-${offer.id}-${uid}">
                    <span class="event__offer-title">${he.encode(offer.title)}</span>
                    &plus;&euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
                  </label>
                </div>`).join('')}
            </div>
          </section>
          <section class="event__section event__section--destination">
            <h3 class="event__section-title event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${he.encode(description || '')}</p>
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${safePictures.map(({ src, description: d }) => `<img class="event__photo" src="${src}" alt="${he.encode(d)}">`).join('')}
              </div>
            </div>
          </section>
        </section>
      </form>
    </li>`;
}

export default class FormEditView extends AbstractStatefulView {
  #destinations = null;
  #onSave = null;
  #onClose = null;
  #onCreate = null;
  #onDelete = null;
  #uid = null;
  #datepickerFrom = null;
  #datepickerTo = null;
  #allOffers = null;

  constructor({
    point,
    destinations,
    allOffers,
    onSave,
    onClose,
    isNew = false,
    onCreate = null,
    onDelete = null,
  }) {
    super();
    const safeDestinations = Array.isArray(destinations) ? destinations : [];

    this.#uid = Date.now();
    this.#destinations = safeDestinations;
    this.#onSave = onSave;
    this.#onClose = onClose;
    this.#onCreate = onCreate;
    this.#onDelete = onDelete;
    this.#allOffers = allOffers;

    const destination = safeDestinations.find((item) => item.id === point.destination);

    const currentDestination = destination || {
      id: '',
      name: '',
      description: '',
      pictures: [],
    };

    const foundOffers = this.#allOffers?.find((item) => item.type === point.type);
    const availableOffers = foundOffers?.offers || [];

    this._setState({
      point: { ...point },
      currentDestination: {
        id: currentDestination.id,
        name: currentDestination.name,
        description: currentDestination.description,
        pictures: currentDestination.pictures,
      },
      availableOffers: availableOffers.map((offer) => ({
        id: offer.id,
        title: offer.title,
        price: offer.price,
      })),
      isNew: isNew,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    });
  }

  get template() {
    const { point, currentDestination, availableOffers, isDisabled, isSaving, isDeleting } = this._state;
    return createTemplate(
      point,
      availableOffers,
      currentDestination.name,
      this.#destinations,
      currentDestination.description,
      currentDestination.pictures,
      this._state.isNew,
      this.#uid,
      isDisabled,
      isSaving,
      isDeleting,
    );
  }

  _restoreHandlers() {
    this.element.querySelector('.event__reset-btn')
      ?.addEventListener('click', this.#formDeleteClickHandler);

    this.element.querySelector('form')
      ?.addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__rollup-btn')
      ?.addEventListener('click', this.#formCloseClickHandler);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#onSave(this._state.point);
  };

  #formCloseClickHandler = (evt) => {
    evt.preventDefault();
    this.#onClose();
  };

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();

    if (this._state.isNew) {
      this.#onClose();
    } else {
      this.setDeleting();
      if (this.#onDelete) {
        this.#onDelete();
      }
    }
  };

  setSaving() {
    this.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setDeleting() {
    this.updateElement({
      isDisabled: true,
      isDeleting: true,
    });
  }
}
