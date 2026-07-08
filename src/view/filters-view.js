import AbstractView from '../framework/view/abstract-view.js';

function createFilterTemplate(filters, currentFilterType) {
  const filterItems = filters
    .map((filter) => {
      const isChecked = filter.type === currentFilterType;
      const isDisabled = filter.count === 0;

      return `
      <div class="trip-filters__filter">
        <input id="filter-${filter.type}"
          class="trip-filters__filter-input visually-hidden"
          type="radio"
          name="trip-filter"
          value="${filter.type}"
          ${isChecked ? 'checked' : ''}
          ${isDisabled ? 'disabled' : ''}>
        <label class="trip-filters__filter-label" for="filter-${filter.type}">
          ${filter.name}
        </label>
      </div>
    `;
    })
    .join('');

  return `<form class="trip-filters">${filterItems}</form>`;
}
export default class FilterView extends AbstractView {
  #filters = [];
  #currentFilterType = null;
  #onFilterChange = null;

  constructor({ filters, currentFilterType, onFilterChange }) {
    super();
    this.#filters = filters;
    this.#currentFilterType = currentFilterType;
    this.#onFilterChange = onFilterChange;
  }

  #handleFilterChange = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }
    this.#onFilterChange(evt.target.value);
  };

  setFilterChangeHandler() {
    this.element.querySelectorAll('.trip-filters__filter-input')
      .forEach((input) => {
        input.addEventListener('change', this.#handleFilterChange);
      });
  }

  get template() {
    return createFilterTemplate(this.#filters, this.#currentFilterType);
  }
}


