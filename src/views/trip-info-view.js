import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { escapeHTML } from '../utils/escape.js';

function createTemplate({ title, dates, cost }) {
  return `
    <div class="trip-info">
      <div class="trip-info__main">
        <p class="trip-info__title">${escapeHTML(title)}</p>
        <p class="trip-info__dates">${escapeHTML(dates)}</p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${escapeHTML(cost)}</span>
      </p>
    </div>
  `;
}

export default class TripInfoView extends AbstractStatefulView {
  constructor({ tripInfo }) {
    super();
    this._setState({ tripInfo });
  }

  get template() {
    return createTemplate(this._state.tripInfo);
  }

  _restoreHandlers() {
  }
}
