import { render } from '../framework/render.js';
import TripInfoView from '../views/trip-info-view.js';
import { UpdateType } from '../const.js';
import { formatDate } from '../utils/date.js';

export default class TripInfoPresenter {
  #tripInfoView = null;
  #pointsModel = null;
  #offersModel = null;
  #destinationsModel = null;
  #container = null;

  constructor({ pointsModel, offersModel, destinationsModel, container }) {
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#container = container;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#offersModel.addObserver(this.#handleModelEvent);
    this.#destinationsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    this.#renderTripInfo();
  }

  #renderTripInfo() {
    const tripInfo = this.#getTripInfo();
    this.#tripInfoView = new TripInfoView({ tripInfo });
    render(this.#tripInfoView, this.#container);
  }

  #handleModelEvent = (updateType) => {
    if (updateType === UpdateType.INIT || updateType === UpdateType.PATCH || updateType === UpdateType.MINOR || updateType === UpdateType.MAJOR) {
      this.#updateTripInfo();
    }
  };

  #updateTripInfo() {
    if (!this.#tripInfoView) {
      return;
    }
    const tripInfo = this.#getTripInfo();
    this.#tripInfoView.updateElement({ tripInfo });
  }

  #getTripInfo() {
    const points = this.#pointsModel.points;
    if (points.length === 0) {
      return { title: '', dates: '', cost: '0' };
    }

    const sortedPoints = [...points].sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));

    const destinations = sortedPoints.map((point) => this.#getDestinationName(point.destination));
    const title = this.#formatRoute(destinations);

    const startDate = sortedPoints[0].dateFrom;
    const endDate = sortedPoints[sortedPoints.length - 1].dateTo;
    const dates = this.#formatDateRange(startDate, endDate);

    const cost = this.#calculateTotalCost(sortedPoints);

    return { title, dates, cost };
  }

  #getDestinationName(destinationId) {
    const destination = this.#destinationsModel.getDestinationById(destinationId);
    return destination ? destination.name : '';
  }

  #formatRoute(destinations) {
    if (destinations.length <= 3) {
      return destinations.join(' — ');
    }
    return `${destinations[0]} — ... — ${destinations[destinations.length - 1]}`;
  }

  #calculateTotalCost(points) {
    return points.reduce((sum, point) => {
      let pointCost = point.basePrice;
      const selectedOffers = this.#offersModel.getSelectedOffers(point.type, point.offers);
      pointCost += selectedOffers.reduce((offerSum, offer) => offerSum + offer.price, 0);
      return sum + pointCost;
    }, 0);
  }

  #formatDateRange(start, end) {
    const startFormatted = formatDate(start, 'day-month');
    const endFormatted = formatDate(end, 'day-month');

    const startMonth = startFormatted.split(' ')[1];
    const endMonth = endFormatted.split(' ')[1];

    if (startMonth === endMonth) {
      return `${startFormatted} — ${endFormatted.split(' ')[0]}`;
    }

    return `${startFormatted} — ${endFormatted}`;
  }
}
