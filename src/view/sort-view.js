import AbstractView from '../framework/view/abstract-view.js';

function createSortTemplate(currentSortType) {
  const sortTypes = [
    { type: 'day', label: 'Day', isDisabled: false },
    { type: 'event', label: 'Event', isDisabled: true },
    { type: 'time', label: 'Time', isDisabled: false },
    { type: 'price', label: 'Price', isDisabled: false },
    { type: 'offer', label: 'Offers', isDisabled: true }
  ];

  return `
    <form class="trip-events__trip-sort  trip-sort" action="#" method="get">
      ${sortTypes.map(({ type, label, isDisabled }) => `
        <div class="trip-sort__item  trip-sort__item--${type}">
          <input
            id="sort-${type}"
            class="trip-sort__input  visually-hidden"
            type="radio"
            name="trip-sort"
            value="sort-${type}"
            ${isDisabled ? 'disabled' : ''}
            ${currentSortType === type ? 'checked' : ''}
            data-sort-type="${type}">
          <label class="trip-sort__btn" for="sort-${type}">
            ${label}
          </label>
        </div>
      `).join('')}
    </form>
  `;
}
export default class SortView extends AbstractView {
  #currentSortType = 'day';
  #onSortChange = null;

  constructor({ onSortChange, currentSortType = 'day' }) {
    super();
    this.#onSortChange = onSortChange;
    this.#currentSortType = currentSortType;

    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    const target = evt.target.closest('.trip-sort__input');
    if (!target) {
      return;
    }
    if (target.disabled) {
      return;
    }

    evt.preventDefault();

    const sortType = target.dataset.sortType;
    if (!sortType) {
      return;
    }

    this.#onSortChange(sortType);
  };
}
