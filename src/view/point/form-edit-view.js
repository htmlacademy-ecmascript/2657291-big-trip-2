import he from 'he';
import { POINTS_TYPES } from '../../const';
import AbstractStatefulView from '../../framework/view/abstract-stateful-view.js';
import { formatDateForInput } from '../../common/utils.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function createTemplate(point, offers, destinationName, destinations, description, pictures, isNew) {
  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${POINTS_TYPES.map((type) => `
                  <div class="event__type-item">
                    <input id="event-type-${type}-1" class="event__type-input visually-hidden"
                           type="radio" name="event-type" value="${type}" ${point.type === type ? 'checked' : ''}>
                    <label class="event__type-label event__type-label--${type}" for="event-type-${type}-1">
                      ${[...type][0].toUpperCase() + [...type].slice(1).join('')}
                    </label>
                  </div>`).join('')}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">${point.type}</label>
            <input class="event__input event__input--destination" id="event-destination-1" type="text"
                   name="event-destination" value="${he.encode(destinationName || '')}" list="destination-list-1">
            <datalist id="destination-list-1">
              ${destinations.map((d) => `<option value="${he.encode(d.name)}"></option>`).join('')}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time" id="event-start-time-1" type="text"
                   name="event-start-time" value="${formatDateForInput(point.dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time" id="event-end-time-1" type="text"
                   name="event-end-time" value="${formatDateForInput(point.dateTo)}">
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-1"><span class="visually-hidden">Price</span>&euro;</label>
            <input class="event__input event__input--price" id="event-price-1" type="text" name="event-price"
                   value="${point.basePrice}">
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          ${isNew ? '' : '<button class="event__reset-btn" type="reset">Delete</button>'}
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${offers.map((offer) => `
                <div class="event__offer-selector">
                  <input class="event__offer-checkbox visually-hidden" id="${offer.id}" type="checkbox"
                         name="event-offer-luggage" ${point.offers.includes(offer.id) ? 'checked' : ''}>
                  <label class="event__offer-label" for="${offer.id}">
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
                ${pictures.map(({ src, description: d }) => `<img class="event__photo" src="${src}" alt="${he.encode(d)}">`).join('')}
              </div>
            </div>
          </section>
        </section>
      </form>
    </li>`;
}

export default class FormEditView extends AbstractStatefulView {
  #destinations = null;
  #pointModel = null;
  #onSave = null;
  #onClose = null;
  #isNew = false;
  #onCreate = null;
  #datepickerFrom = null;
  #datepickerTo = null;
  #onDelete = null;

  constructor({
    point,
    offers,
    destinationName,
    description,
    pictures,
    destinations,
    pointModel,
    onSave,
    onClose,
    isNew = false,
    onCreate = null,
    onDelete = null,
  }) {
    super();
    this._setState({ point, offers, destinationName, description, pictures, isNew });
    this.#destinations = destinations;
    this.#pointModel = pointModel;
    this.#onSave = onSave;
    this.#onClose = onClose;
    this.#isNew = isNew;
    this.#onCreate = onCreate;
    this.#onDelete = onDelete;
    this._restoreHandlers();
  }

  get template() {
    const { point, offers, destinationName, description, pictures, isNew } = this._state;
    return createTemplate(point, offers, destinationName, this.#destinations, description, pictures, isNew);
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

  removeElement() {
    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy(); this.#datepickerFrom = null;
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy(); this.#datepickerTo = null;
    }
    const deleteBtn = this.element?.querySelector('.event__reset-btn');
    if (deleteBtn) {
      deleteBtn.removeEventListener('click', this.#handleDeleteClick);
    }
    super.removeElement();
  }

  _restoreHandlers() {
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#handleCloseClick);
    this.element.querySelector('form').addEventListener('submit', this.#handleSave);
    this.element.querySelectorAll('.event__type-input').forEach((i) => i.addEventListener('change', this.#handleTypeChange));
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#handleDestinationChange);
    this.element.querySelectorAll('.event__offer-checkbox').forEach((cb) => cb.addEventListener('change', this.#handleOfferChange));

    const priceInput = this.element.querySelector('.event__input--price');
    priceInput.addEventListener('input', this.#handlePriceInput);
    priceInput.addEventListener('change', this.#handlePriceChange);

    const deleteBtn = this.element.querySelector('.event__reset-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', this.#handleDeleteClick);
    }

    this.#datepickerFrom = flatpickr(this.element.querySelector('#event-start-time-1'), {
      enableTime: true, dateFormat: 'd/m/y H:i', defaultDate: this._state.point.dateFrom,
      onChange: (selectedDates) => {
        if (selectedDates.length) {
          const updatedPoint = { ...this._state.point, dateFrom: selectedDates[0].toISOString() };
          this._setState({ point: updatedPoint });
        }
      }
    });
    this.#datepickerTo = flatpickr(this.element.querySelector('#event-end-time-1'), {
      enableTime: true, dateFormat: 'd/m/y H:i', defaultDate: this._state.point.dateTo,
      onChange: (selectedDates) => {
        if (selectedDates.length) {
          const updatedPoint = { ...this._state.point, dateTo: selectedDates[0].toISOString() };
          this._setState({ point: updatedPoint });
        }
      }
    });
  }

  #handlePriceInput = (evt) => {
    const input = evt.target;
    let filtered = input.value.replace(/[^\d.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) {
      filtered = `${parts[0] }.${ parts.slice(1).join('')}`;
    }
    input.value = filtered;
  };

  #handlePriceChange = (evt) => {
    const value = parseFloat(evt.target.value);
    if (!isNaN(value)) {
      const updatedPoint = { ...this._state.point, basePrice: value };
      this._setState({ point: updatedPoint });
    } else {
      evt.target.value = '0';
      this._setState({ point: { ...this._state.point, basePrice: 0 } });
    }
  };

  #handleTypeChange = (evt) => {
    const newType = evt.target.value;
    const updatedPoint = { ...this._state.point, type: newType, offers: [] };
    const newOffers = this.#pointModel.getOffersByType(newType) || [];
    this._setState({ point: updatedPoint, offers: newOffers });
    const toggle = this.element.querySelector('#event-type-toggle-1');
    if (toggle) {
      toggle.checked = false;
    }
  };

  #handleDestinationChange = (evt) => {
    const name = evt.target.value;
    const dest = this.#destinations.find((d) => d.name === name);
    if (dest) {
      this._setState({
        destinationName: dest.name,
        description: dest.description,
        pictures: dest.pictures,
      });
    }
  };

  _getPointData() {
    const { point, offers, destinationName } = this._state;
    const destination = this.#destinations.find((d) => d.name === destinationName);
    const selectedOffers = offers.filter((o) => point.offers.includes(o.id)).map((o) => o.id);
    return {
      ...point,
      type: point.type,
      destination: destination?.id || point.destination,
      basePrice: point.basePrice,
      dateFrom: point.dateFrom,
      dateTo: point.dateTo,
      offers: selectedOffers,
    };
  }

  #handleOfferChange = (evt) => {
    const offerId = evt.target.id;
    const updatedPoint = { ...this._state.point };
    if (updatedPoint.offers.includes(offerId)) {
      updatedPoint.offers = updatedPoint.offers.filter((id) => id !== offerId);
    } else {
      updatedPoint.offers = [...updatedPoint.offers, offerId];
    }
    this._setState({ point: updatedPoint });
  };

  #handleDeleteClick = (evt) => {
    evt.preventDefault();
    if (this.#onDelete) {
      this.#onDelete();
    }
  };
}
