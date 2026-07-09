import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';

function getMessageByFilter(filterType) {
  const messages = {
    [FilterType.EVERYTHING]: 'Click New Event to create your first point',
    [FilterType.PAST]: 'There are no past events now',
    [FilterType.PRESENT]: 'There are no present events now',
    [FilterType.FUTURE]: 'There are no future events now'
  };
  return messages[filterType] || messages[FilterType.EVERYTHING];
}

function createEmptyTemplate(filterType) {
  const message = getMessageByFilter(filterType);

  return `
    <section class="trip-events">
      <p class="trip-events__msg">${message}</p>
    </section>
  `;
}

export default class EmptyView extends AbstractView {
  #filterType = null;

  constructor({ filterType }) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createEmptyTemplate(this.#filterType);
  }
}
