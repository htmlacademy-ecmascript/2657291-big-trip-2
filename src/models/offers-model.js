import Observable from '../framework/observable.js';

export default class OffersModel extends Observable {
  #offers = [];
  #server = null;

  constructor(server) {
    super();
    this.#server = server;
  }

  async init() {
    this.#offers = await this.#server.getOffers();
  }

  getOffersByType(type) {
    const group = this.#offers.find((item) => item.type === type);
    return group ? group.offers : [];
  }

  getSelectedOffers(type, selectedIds) {
    const allOffers = this.getOffersByType(type);
    return allOffers.filter((offer) => selectedIds.includes(offer.id));
  }
}
