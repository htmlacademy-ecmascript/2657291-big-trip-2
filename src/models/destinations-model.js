import Observable from '../framework/observable.js';

export default class DestinationsModel extends Observable {
  #destinations = [];
  #server = null;

  constructor(server) {
    super();
    this.#server = server;
  }

  async init() {
    this.#destinations = await this.#server.getDestinations();
  }

  getDestinationNameById(id){
    return this.#destinations.find((item) => item.id === id).name;
  }

  getDestinationById(id) {
    return this.#destinations.find((item) => item.id === id);
  }

  get destinations() {
    return this.#destinations;
  }
}

