import AbstractView from '../framework/view/abstract-view.js';

function createListTemplate() {
  return ('<ul class="trip-events__list"></ul>');
}
export default class PointListView extends AbstractView {
  get template() { /*Переделать на геттер. Посмотреть как?*/
    return createListTemplate();
  }
}


