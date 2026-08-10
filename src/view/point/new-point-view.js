import AbstractStatefulView from '../../framework/view/abstract-stateful-view.js';
import { POINTS_TYPES } from '../../const.js';
import { formatDateForInput } from '../../common/utils.js';

function createTemplate(point) {
  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-new">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/flight.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-new" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${POINTS_TYPES.map((type) => `
                  <div class="event__type-item">
                    <input id="event-type-${type}-new" class="event__type-input visually-hidden"
                          type="radio" name="event-type" value="${type}" ${type === 'flight' ? 'checked' : ''}>
                    <label class="event__type-label event__type-label--${type}" for="event-type-${type}-new">
                      ${type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  </div>`).join('')}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-new">flight</label>
            <input class="event__input event__input--destination" id="event-destination-new" type="text"
                   name="event-destination" value="" list="destination-list-new">
            <datalist id="destination-list-new"></datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-new">From</label>
            <input class="event__input event__input--time" id="event-start-time-new" type="text" name="event-start-time" value="${formatDateForInput(point.dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-new">To</label>
            <input class="event__input event__input--time" id="event-end-time-new" type="text" name="event-end-time" value="${formatDateForInput(point.dateTo)}">
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-new"><span class="visually-hidden">Price</span>&euro;</label>
            <input class="event__input event__input--price" id="event-price-new" type="text" name="event-price" value="0">
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Cancel</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        <section class="event__details">
          <section class="event__section event__section--offers">
            <h3 class="event__section-title event__section-title--offers">Offers</h3>
            <div class="event__available-offers"></div>
          </section>
          <section class="event__section event__section--destination">
            <h3 class="event__section-title event__section-title--destination">Destination</h3>
            <p class="event__destination-description"></p>
            <div class="event__photos-container">
              <div class="event__photos-tape"></div>
            </div>
          </section>
        </section>
      </form>
    </li>`;
}

export default class NewPointView extends AbstractStatefulView {
  #onClose = null;
  #onSave = null;
  #destinations = null;
  #allOffers = null;

  constructor({ point, destinations, allOffers, onSave, onClose }) {
    super();
    this._setState({ point });
    this.#onSave = onSave;
    this.#onClose = onClose;
    this.#destinations = destinations;
    this.#allOffers = allOffers;
  }

  get template() {
    const { point } = this._state;
    return createTemplate(point);
  }

  _restoreHandlers() {
    const cancelBtn = this.element.querySelector('.event__reset-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', this.#handleCloseClick);
    }
    const rollupBtn = this.element.querySelector('.event__rollup-btn');
    rollupBtn.addEventListener('click', this.#handleCloseClick);

    this.element.querySelector('form').addEventListener('submit', this.#handleSave);
  }


  #handleCloseClick = (evt) => {
    evt.preventDefault();
    this.#onClose();
  };

  #handleSave = (evt) => {
    evt.preventDefault();
    // Собираем данные из формы
    const pointData = this._getPointData();
    this.#onSave(pointData);
  };

  _getPointData() {
    return this._state.point;
  }
}
