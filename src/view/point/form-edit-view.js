import { POINTS_TYPES } from '../../const';
import AbstractStatefulView from '../../framework/view/abstract-stateful-view.js';
import { formatDateForInput } from '../../common/utils.js';
//import { formatDate, getDuration } from '../common/utils.js';

function createTemplate(point, offers, destinationName, destinations, description, pictures, isNew) {

  return (`
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                  ${POINTS_TYPES.map((type) => `
                      <div class="event__type-item">
                        <input id="event-type-${type}-1"
                              class="event__type-input visually-hidden"
                              type="radio"
                              name="event-type"
                              value="${type}"
                              ${point.type === type ? 'checked' : ''}>
                        <label class="event__type-label event__type-label--${type}"
                              for="event-type-${type}-1">
                          ${[...type][0].toUpperCase() + [...type].slice(1).join('')}
                        </label>
                      </div>
                    `).join('')}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${point.type}
            </label>
            <input class="event__input  event__input--destination"
                id="event-destination-1"
                type="text"
                name="event-destination"
                value="${destinationName || ''}"
                list="destination-list-1">
            <datalist id="destination-list-1">
              ${destinations.map((destination) => `
                <option value="${destination.name}"></option>
              `).join('')}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time"
                id="event-start-time-1"
                type="text"
                name="event-start-time"
                value="${formatDateForInput(point.dateFrom)}">
                &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time"
                id="event-end-time-1"
                type="text"
                name="event-end-time"
                value=${formatDateForInput(point.dateTo)}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price"
                id="event-price-1"
                type="text"
                name="event-price"
                value="${point.basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          ${isNew ? '' : '<button class="event__reset-btn" type="reset">Delete</button>'}
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>

            <div class="event__available-offers">

            ${offers.map((offer) => (`
              <div class="event__offer-selector">
                <input
                 class="event__offer-checkbox  visually-hidden"
                 id="${offer.id}"
                 type="checkbox"
                 name="event-offer-luggage"
                 ${point.offers.includes(offer.id) ? 'checked' : ''}
                 >
                <label class="event__offer-label" for="event-offer-luggage-1">
                  <span class="event__offer-title">${offer.title}</span>
                  &plus;&euro;&nbsp;
                  <span class="event__offer-price">${offer.price}</span>
                </label>
              </div>
              `)).join('')}
            </div>
          </section>

          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${description || ''}</p>
            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${pictures.map(({ src, description: pictureDescription }) => (`
                  <img class="event__photo" src=${src} alt=${pictureDescription}>
                `)).join('')}
              </div>
            </div>
          </section>
        </section>
      </form>
    </li>
  `);
}
export default class FormEditView extends AbstractStatefulView {
  #destinations = null;
  #pointModel = null;
  #onSave = null;
  #onClose = null;
  #isNew = false;
  #onCreate = null;

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
  }) {
    super();

    this._setState({
      point: point,
      offers: offers,
      destinationName: destinationName,
      description: description,
      pictures: pictures,
      isNew
    });

    this.#destinations = destinations;
    this.#pointModel = pointModel;
    this.#onSave = onSave;
    this.#onClose = onClose;
    this.#isNew = isNew;
    this.#onCreate = onCreate;
    this._restoreHandlers();
  }

  get template() {
    const { point, offers, destinationName, description, pictures, isNew } = this._state;
    return createTemplate(
      point,
      offers,
      destinationName,
      this.#destinations,
      description,
      pictures,
      isNew
    );
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
    super.removeElement();
  }

  _restoreHandlers() {
    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#handleCloseClick);
    this.element.querySelector('form')
      .addEventListener('submit', this.#handleSave);
    this.element.querySelectorAll('.event__type-input')
      .forEach((item) => item.addEventListener('change', this.#handleTypeChange));

    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#handleDestinationChange);
    this.element.querySelectorAll('.event__offer-checkbox')
      .forEach((checkbox) => checkbox.addEventListener('change', this.#handleOfferChange));
    this.element.querySelector('.event__input--price')
      .addEventListener('change', this.#handlePriceChange);
    this.element.querySelector('#event-start-time-1')
      .addEventListener('change', this.#handleDateChange);
    this.element.querySelector('#event-end-time-1')
      .addEventListener('change', this.#handleDateChange);
  }

  #handlePriceChange = (evt) => {
    const value = parseFloat(evt.target.value);
    if (!isNaN(value)) {
      const updatedPoint = { ...this._state.point, basePrice: value };
      this._setState({ point: updatedPoint });
    }
  };

  #handleTypeChange = (evt) => {
    const newType = evt.target.value;
    const currentState = this._state;
    const updatedPoint = { ...currentState.point, type: newType };
    const newOffers = this.#pointModel.getOffersByType(newType) || [];
    this._setState({ point: updatedPoint, offers: newOffers });
  };

  #handleDestinationChange = (evt) => {
    const name = evt.target.value;
    const destination = this.#destinations.find((d) => d.name === name);
    if (destination) {
      this._setState({
        destinationName: destination.name,
        description: destination.description,
        pictures: destination.pictures,
      });
    }
  };

  _getPointData() {
    const { point, offers, destinationName } = this._state;

    const destination = this.#destinations.find((d) => d.name === destinationName);

    // Собираем ID выбранных оферов из offers
    const selectedOffers = offers
      .filter((offer) => point.offers.includes(offer.id))
      .map((offer) => offer.id);

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
    const currentState = this._state;
    const updatedPoint = { ...currentState.point };

    if (updatedPoint.offers.includes(offerId)) {
      // Если уже есть — удаляем
      updatedPoint.offers = updatedPoint.offers.filter((id) => id !== offerId);
    } else {
      // Если нет — добавляем
      updatedPoint.offers = [...updatedPoint.offers, offerId];
    }

    this._setState({ point: updatedPoint });
  };

  #handleDateChange = (evt) => {
    const { name, value } = evt.target;
    // Определяем, какое поле изменилось
    const key = name === 'event-start-time' ? 'dateFrom' : 'dateTo';
    const updatedPoint = { ...this._state.point, [key]: value };
    this._setState({ point: updatedPoint });
  };


}

