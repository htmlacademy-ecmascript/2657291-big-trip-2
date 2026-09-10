import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';

const MESSAGES = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.FUTURE]: 'There are no future events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.PAST]: 'There are no past events now',
};

function createTemplate(filterType, isError) {
  if (isError) {
    return '<p class="trip-events__msg">Failed to load latest route information</p>';
  }

  return `
    <p class="trip-events__msg">
      ${MESSAGES[filterType] || MESSAGES[FilterType.EVERYTHING]}
    </p>
  `;
}

export default class EmptyView extends AbstractView {
  #filterType = null;
  #isError = false;

  constructor({ filterType, isError = false }) {
    super();
    this.#filterType = filterType;
    this.#isError = isError;
  }

  get template() {
    return createTemplate(this.#filterType, this.#isError);
  }
}
