import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { escapeHTML } from '../utils/escape.js';

function createTemplate({
  type,
  basePrice,
  offers,
  destination,
  isFavorite,
  date,
  timeFrom,
  timeTo,
  duration,
  dateFrom,
  dateTo
}) {
  return (`
    <li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${escapeHTML(dateFrom instanceof Date ? dateFrom.toISOString() : String(dateFrom))}">${escapeHTML(date)}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${escapeHTML(type)}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${escapeHTML(type)} ${escapeHTML(destination)}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${escapeHTML(dateFrom instanceof Date ? dateFrom.toISOString() : String(dateFrom))}">${escapeHTML(timeFrom)}</time>
            &mdash;
            <time class="event__end-time" datetime="${escapeHTML(dateTo instanceof Date ? dateTo.toISOString() : String(dateTo))}">${escapeHTML(timeTo)}</time>
          </p>
          <p class="event__duration">${escapeHTML(duration)}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${escapeHTML(String(basePrice))}</span>
        </p>

        ${offers.length > 0 ? `
          <h4 class="visually-hidden">Offers:</h4>
          <ul class="event__selected-offers">
            ${offers.map((offer) => `
              <li class="event__offer">
                <span class="event__offer-title">${escapeHTML(offer.title)}</span>
                &plus;&euro;&nbsp;
                <span class="event__offer-price">${escapeHTML(String(offer.price))}</span>
              </li>
            `).join('')}
          </ul>
        ` : ''}

        <button
          class="event__favorite-btn${isFavorite ? ' event__favorite-btn--active' : ''}"
          type="button"
        >
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>
  `);
}

export default class PointView extends AbstractStatefulView {
  #onFavoriteChange;
  #onOpenForm;

  constructor({ point, onFavoriteChange, onOpenForm }) {
    super();
    this.#onFavoriteChange = onFavoriteChange;
    this.#onOpenForm = onOpenForm;
    this._setState({ point });
    this._restoreHandlers();
  }

  get template() {
    return createTemplate(this._state.point);
  }

  _restoreHandlers() {
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#handleFavoriteButtonClick);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#handleRollupButtonClick);
  }

  #handleFavoriteButtonClick = () => {
    this.#onFavoriteChange();
  };

  #handleRollupButtonClick = () => {
    this.#onOpenForm();
  };
}
