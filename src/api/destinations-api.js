import { EndPoints } from '../const.js';
import ApiService from '../framework/api-service.js';

export default class DestinationsApiService extends ApiService {

  async getDestinations() {
    const response = await this._load({
      url: EndPoints.DESTINATIONS,
    });

    const result = await ApiService.parseResponse(response);
    return result;
  }

}
