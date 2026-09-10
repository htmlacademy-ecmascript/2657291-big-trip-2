import Observable from '../framework/observable.js';

export default class DestinationsModel extends Observable {
  #destinations = [];
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
      this.#destinations = await this.#server.getDestinations();
      this.#isLoadingFailed = false;
    } catch (error) {
      this.#destinations = [];
      this.#isLoadingFailed = true;
    } finally {
      this.#isLoading = false;
    }
  }

  getDestinationNameById(id) {
    return this.#destinations.find((item) => item.id === id)?.name || '';
  }

  getDestinationById(id) {
    return this.#destinations.find((item) => item.id === id);
  }

  get destinations() {
    return this.#destinations;
  }

  get isLoading() {
    return this.#isLoading;
  }

  get isLoadingFailed() {
    return this.#isLoadingFailed;
  }
}
