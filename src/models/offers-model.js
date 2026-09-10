import Observable from '../framework/observable.js';

export default class OffersModel extends Observable {
  #offers = [];
  #server = null;
  #isLoading = false;
  #isLoadingFailed = false;

  constructor(server) {
    super();
    this.#server = server;
  }

  async init() {
    this.#isLoading = true;
    try {
      this.#offers = await this.#server.getOffers();
      this.#isLoadingFailed = false;
    } catch (error) {
      this.#offers = [];
      this.#isLoadingFailed = true;
    } finally {
      this.#isLoading = false;
    }
  }

  getOffersByType(type) {
    const group = this.#offers.find((item) => item.type === type);
    return group ? group.offers : [];
  }

  getSelectedOffers(type, selectedIds) {
    const allOffers = this.getOffersByType(type);
    return allOffers.filter((offer) => selectedIds.includes(offer.id));
  }

  get isLoading() {
    return this.#isLoading;
  }

  get isLoadingFailed() {
    return this.#isLoadingFailed;
  }
}
