import { EndPoints } from '../const.js';
import ApiService from '../framework/api-service.js';

export default class OffersApiService extends ApiService {

  async getOffers() {
    const response = await this._load({
      url: EndPoints.OFFERS,
    });

    const result = await ApiService.parseResponse(response);
    return result;
  }
}
