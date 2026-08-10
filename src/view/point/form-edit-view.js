import he from 'he';
import { POINTS_TYPES } from '../../const';
import AbstractStatefulView from '../../framework/view/abstract-stateful-view.js';
import { formatDateForInput } from '../../common/utils.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function createTemplate(point, offers, destinationName, destinations, description, pictures, isNew, uid) {
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
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-${uid}" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${POINTS_TYPES.map((type) => `
                  <div class="event__type-item">
                    <input id="event-type-${type}-${uid}" class="event__type-input visually-hidden"
                           type="radio" name="event-type" value="${type}" ${point.type === type ? 'checked' : ''}>
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
                   name="event-destination" value="${he.encode(destinationName || '')}" list="destination-list-${uid}">
            <datalist id="destination-list-${uid}">
              ${safeDestinations.map((d) => `<option value="${he.encode(d.name)}"></option>`).join('')}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${uid}">From</label>
            <input class="event__input event__input--time" id="event-start-time-${uid}" type="text"
                   name="event-start-time" value="${formatDateForInput(point.dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-${uid}">To</label>
            <input class="event__input event__input--time" id="event-end-time-${uid}" type="text"
                   name="event-end-time" value="${formatDateForInput(point.dateTo)}">
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-${uid}"><span class="visually-hidden">Price</span>&euro;</label>
            <input class="event__input event__input--price" id="event-price-${uid}" type="text" name="event-price"
                   value="${point.basePrice}">
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          ${isNew ? '<button class="event__reset-btn" type="reset">Cancel</button>' : '<button class="event__reset-btn" type="reset">Delete</button>'}
          <button class="event__rollup-btn" type="button">
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
                         name="${offer.id}" ${point.offers.includes(offer.id) ? 'checked' : ''}>
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

    // Находим destination по ID из point
    const destination = safeDestinations.find((item) => item.id === point.destination);

    const currentDestination = destination || {
      id: '',
      name: '',
      description: '',
      pictures: [],
    };

    // Находим офферы для типа
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
    });
  }

  get template() {
    const { point, currentDestination, availableOffers } = this._state;
    return createTemplate(
      point, // { id, type, ... }
      availableOffers, // [ { id, title, price } ]
      currentDestination.name, // "Amsterdam"
      this.#destinations, // все города
      currentDestination.description,
      currentDestination.pictures,
      this._state.isNew,
      this.#uid
    );
  }

  _restoreHandlers() {
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#handleCloseClick);
    this.element.querySelector('form').addEventListener('submit', this.#handleSave);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#handleTypeChange);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#handleDestinationChange);

    /* ------ ИСПРАВИТЬ!!! ---*/
    this.element.querySelectorAll('.event__offer-checkbox').forEach((item) => item.addEventListener('change', this.#handleOfferChange));

    const priceInput = this.element.querySelector('.event__input--price');
    priceInput.addEventListener('input', this.#handlePriceInput);
    priceInput.addEventListener('change', this.#handlePriceChange);

    const deleteBtn = this.element.querySelector('.event__reset-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', this.#handleDeleteClick);
    }

    if (!this.#datepickerFrom && !this.#datepickerTo) {
      this.#createDatepickers();
    }
  }

  #createDatepickers() {
    const startTimeInput = this.element.querySelector('input[name="event-start-time"]');
    const endTimeInput = this.element.querySelector('input[name="event-end-time"]');

    if (startTimeInput) {
      this.#datepickerFrom = flatpickr(startTimeInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.point.dateFrom,
        onChange: (selectedDates) => {
          if (selectedDates.length) {
            const newDate = selectedDates[0].toISOString();
            if (newDate !== this._state.point.dateFrom) {
              const updatedPoint = { ...this._state.point, dateFrom: newDate };
              this.updateElement({ point: updatedPoint });
            }
          }
        }
      });
    }

    if (endTimeInput) {
      this.#datepickerTo = flatpickr(endTimeInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: this._state.point.dateTo,
        onChange: (selectedDates) => {
          if (selectedDates.length) {
            const newDate = selectedDates[0].toISOString();
            if (newDate !== this._state.point.dateTo) {
              const updatedPoint = { ...this._state.point, dateTo: newDate };
              this.updateElement({ point: updatedPoint });
            }
          }
        }
      });
    }
  }

  removeElement() {
    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
    const deleteBtn = this.element?.querySelector('.event__reset-btn');
    if (deleteBtn) {
      deleteBtn.removeEventListener('click', this.#handleDeleteClick);
    }
    super.removeElement();
  }

  #handleSave = (evt) => {
    evt.preventDefault();
    const pointData = this._getPointData();
    if (this._state.isNew) {
      this.#onCreate(pointData);
    } else {
      this.#onSave(pointData);
    }
  };

  #handleCloseClick = (evt) => {
    evt.preventDefault();
    this.#onClose();
  };

  #handlePriceInput = (evt) => {
    const input = evt.target;
    let filtered = input.value.replace(/[^\d.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) {
      filtered = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    input.value = filtered;
  };

  #handlePriceChange = (evt) => {
    const value = parseFloat(evt.target.value);
    if (!isNaN(value)) {
      const updatedPoint = { ...this._state.point, basePrice: value };
      this.updateElement({ point: updatedPoint });
    } else {
      evt.target.value = '0';
      this.updateElement({ point: { ...this._state.point, basePrice: 0 } });
    }
  };

  #handleTypeChange = (evt) => {
    const newType = evt.target.value;
    const updatedPoint = { ...this._state.point, type: newType, offers: [] };

    const foundOffers = this.#allOffers?.find((item) => item.type === newType);
    const newOffers = foundOffers?.offers || [];

    this.updateElement({
      point: updatedPoint,
      availableOffers: newOffers,
    });
  };

  #handleDestinationChange = (evt) => {
    const name = evt.target.value;
    const destination = this.#destinations.find((item) => item.name === name);
    if (destination) {
      this.updateElement({
        currentDestination: {
          id: destination.id,
          name: destination.name,
          description: destination.description,
          pictures: destination.pictures,
        }
      });
    }
  };

  _getPointData() {
    const { point, availableOffers, currentDestination } = this._state;
    const selectedOffers = availableOffers
      .filter((offer) => point.offers.includes(offer.id))
      .map((offer) => offer.id);

    return {
      id: point.id,
      type: point.type,
      destination: currentDestination.id || point.destination,
      dateFrom: point.dateFrom,
      dateTo: point.dateTo,
      basePrice: point.basePrice,
      offers: selectedOffers,
      isFavorite: point.isFavorite,
    };
  }

  #handleOfferChange = (evt) => {
    const offerId = evt.target.name;
    let currentCheckedOffers = [...this._state.point.offers];
    if(evt.target.checked) {
      currentCheckedOffers.push(offerId);
    } else {
      currentCheckedOffers = currentCheckedOffers.filter((item) => item !== offerId);
    }
    this.updateElement({
      point: {
        ...this._state.point,
        offers: currentCheckedOffers
      }
    });
  };

  #handleDeleteClick = (evt) => {
    evt.preventDefault();
    if (this.#onDelete) {
      this.#onDelete();
    }
  };
}
