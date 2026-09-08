import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { formatDateForInput } from '../utils/date.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { escapeHTML } from '../utils/escape.js';

dayjs.extend(customParseFormat);

function createTemplate(point, destinations, availableOffers) {
  const {
    type = 'flight',
    destination = '',
    basePrice = 0,
    dateFrom = '',
    dateTo = '',
    offers = []
  } = point || {};

  const destinationObj = destinations.find((item) => item.id === destination);
  const destinationName = destinationObj ? destinationObj.name : destination;

  const isEdit = Boolean(point);
  const formattedDateFrom = dateFrom ? formatDateForInput(dateFrom) : '';
  const formattedDateTo = dateTo ? formatDateForInput(dateTo) : '';

  const destinationOptions = destinations.map((item) =>
    `<option value="${escapeHTML(item.name)}"></option>`
  ).join('');

  const offersBlock = availableOffers.length > 0 ? `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${availableOffers.map((offer) => `
          <div class="event__offer-selector">
            <input
              class="event__offer-checkbox visually-hidden"
              id="event-offer-${offer.id}-1"
              type="checkbox"
              name="event-offer-${offer.id}"
              ${offers.includes(offer.id) ? 'checked' : ''}
            >
            <label class="event__offer-label" for="event-offer-${offer.id}-1">
              <span class="event__offer-title">${escapeHTML(offer.title)}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${escapeHTML(offer.price)}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  const selectedDestination = destinations.find((item) => item.id === destination || item.name === destination);
  const destinationBlock = selectedDestination && (selectedDestination.description || selectedDestination.pictures) ? `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${escapeHTML(selectedDestination.description || '')}</p>
      ${selectedDestination.pictures ? `
        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${selectedDestination.pictures.map((pic) => `<img class="event__photo" src="${escapeHTML(pic.src)}" alt="${escapeHTML(pic.description || '')}">`).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  ` : '';

  return `
  <li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="img/icons/${escapeHTML(type)}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Event type</legend>
              ${['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'].map((item) => `
                <div class="event__type-item">
                  <input id="event-type-${item}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${item}" ${type === item ? 'checked' : ''}>
                  <label class="event__type-label event__type-label--${item}" for="event-type-${item}-1">${escapeHTML(item.charAt(0).toUpperCase() + item.slice(1))}</label>
                </div>
              `).join('')}
            </fieldset>
          </div>
        </div>
        <div class="event__field-group event__field-group--destination">
          <label class="event__label event__type-output" for="event-destination-1">${escapeHTML(type)}</label>
          <input class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${escapeHTML(destinationName)}" list="destination-list-1">
          <datalist id="destination-list-1">
            ${destinationOptions}
          </datalist>
        </div>
        <div class="event__field-group event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">From</label>
          <input class="event__input event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${escapeHTML(formattedDateFrom)}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">To</label>
          <input class="event__input event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${escapeHTML(formattedDateTo)}">
        </div>
        <div class="event__field-group event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input event__input--price" id="event-price-1" type="text" name="event-price" value="${escapeHTML(basePrice)}">
        </div>
        <button class="event__save-btn btn btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">${isEdit ? 'Delete' : 'Cancel'}</button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </header>
      ${offersBlock}
      ${destinationBlock}
    </form>
  </li>
  `;
}

export default class FormView extends AbstractStatefulView {
  #onTypeChange;
  #onCloseForm;
  #onSubmit;
  #onDelete;
  #point;

  #destinations;

  constructor({ point = null, destinations = [], availableOffers = [], onTypeChange, onCloseForm, onSubmit, onDelete }) {
    super();
    this.#point = point;
    this.#destinations = destinations;
    this.#onTypeChange = onTypeChange;
    this.#onCloseForm = onCloseForm;
    this.#onSubmit = onSubmit;
    this.#onDelete = onDelete;
    this._setState({ point, availableOffers });
    this._restoreHandlers();
  }

  get template() {
    return createTemplate(this._state.point, this.#destinations, this._state.availableOffers);
  }

  _restoreHandlers() {
    const startInput = this.element.querySelector('#event-start-time-1');
    const endInput = this.element.querySelector('#event-end-time-1');

    flatpickr(startInput, {
      enableTime: true,
      dateFormat: 'd/m/Y H:i',
      defaultDate: this._state.point?.dateFrom ? dayjs(this._state.point.dateFrom).format('DD/MM/YYYY HH:mm') : null,
    });

    flatpickr(endInput, {
      enableTime: true,
      dateFormat: 'd/m/Y H:i',
      defaultDate: this._state.point?.dateTo ? dayjs(this._state.point.dateTo).format('DD/MM/YYYY HH:mm') : null,
    });

    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#handleRollupButtonClick);
    this.element.querySelector('.event--edit').addEventListener('submit', this.#handleSaveButtonClick);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#handleDeleteButtonClick);
    this.element.querySelector('.event__type-list').addEventListener('change', this.#handleTypeChange);
    this.element.querySelector('#event-destination-1').addEventListener('change', this.#handleDestinationChange);
  }

  #collectFormData() {
    const formData = new FormData(this.element.querySelector('.event--edit'));
    const type = this._state.point?.type || formData.get('event-type') || 'flight';
    const destinationName = formData.get('event-destination') || '';
    const destinationObj = this.#destinations.find((item) => item.name === destinationName);
    const destinationId = destinationObj ? destinationObj.id : '';

    const basePrice = Number(formData.get('event-price') || 0);

    const dateFrom = formData.get('event-start-time');
    const dateTo = formData.get('event-end-time');
    const dateFromISO = dateFrom ? dayjs(dateFrom, 'DD/MM/YYYY HH:mm').toISOString() : null;
    const dateToISO = dateTo ? dayjs(dateTo, 'DD/MM/YYYY HH:mm').toISOString() : null;

    const offers = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'))
      .map((checkbox) => checkbox.name.replace('event-offer-', ''));

    return {
      id: this.#point?.id ?? this._state.point?.id ?? undefined,
      type,
      destination: destinationId,
      basePrice,
      dateFrom: dateFromISO,
      dateTo: dateToISO,
      offers,
    };
  }

  #handleTypeChange = (evt) => {
    const newType = evt.target.value;
    const currentData = this.#collectFormData();
    const newOffers = this.#onTypeChange?.(newType) || [];
    const allowedOfferIds = newOffers.map((offer) => offer.id);
    const filteredOffers = currentData.offers.filter((id) => allowedOfferIds.includes(id));
    const newPoint = {
      ...this._state.point,
      ...currentData,
      type: newType,
      offers: filteredOffers,
    };

    this.updateElement({ point: newPoint, availableOffers: newOffers });
  };

  #handleRollupButtonClick = () => {
    this.#onCloseForm();
  };

  #handleSaveButtonClick = (evt) => {
    evt.preventDefault();
    const pointData = this.#collectFormData();

    const dateFromValid = pointData.dateFrom && dayjs(pointData.dateFrom).isValid();
    const dateToValid = pointData.dateTo && dayjs(pointData.dateTo).isValid();

    if (!pointData.destination || !dateFromValid || !dateToValid || pointData.basePrice <= 0) {
      this.shake();
      return;
    }

    if (dayjs(pointData.dateTo).isBefore(pointData.dateFrom)) {
      this.shake();
      return;
    }

    const saveBtn = this.element.querySelector('.event__save-btn');
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    this.#onSubmit(pointData);
  };

  #handleDeleteButtonClick = (evt) => {
    evt.preventDefault();
    if (this.#point) {
      const deleteBtn = this.element.querySelector('.event__reset-btn');
      deleteBtn.textContent = 'Deleting...';
      deleteBtn.disabled = true;
      this.#onDelete(this.#point.id);
    } else {
      this.#onCloseForm();
    }
  };

  shake() {
    this.element.classList.add('shake');
    setTimeout(() => this.element.classList.remove('shake'), 600);
  }

  #handleDestinationChange = (evt) => {
    const destinationName = evt.target.value;
    const destinationObj = this.#destinations.find((item) => item.name === destinationName);
    const destinationId = destinationObj ? destinationObj.id : '';

    const currentData = this.#collectFormData();
    const newPoint = {
      ...this._state.point,
      ...currentData,
      destination: destinationId,
    };

    this.updateElement({ point: newPoint });
  };

  resetButtons() {
    const saveBtn = this.element.querySelector('.event__save-btn');
    const resetBtn = this.element.querySelector('.event__reset-btn');

    if (saveBtn) {
      saveBtn.textContent = 'Save';
      saveBtn.disabled = false;
    }

    if (resetBtn) {
      const isEdit = Boolean(this._state.point);
      resetBtn.textContent = isEdit ? 'Delete' : 'Cancel';
      resetBtn.disabled = false;
    }
  }
}
