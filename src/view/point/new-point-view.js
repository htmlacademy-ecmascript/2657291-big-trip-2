import FormEditView from './form-edit-view.js';
import { getDefaultDateFrom, getDefaultDateTo } from '../../common/utils.js';

export default class NewPointView extends FormEditView {
  constructor({ destinations, allOffers, onSave, onClose }) {
    const defaultPoint = {
      id: null,
      type: 'flight',
      destination: '',
      dateFrom: getDefaultDateFrom(),
      dateTo: getDefaultDateTo(),
      basePrice: 0,
      offers: [],
      isFavorite: false
    };

    super({
      point: defaultPoint,
      destinations: destinations,
      allOffers: allOffers,
      onSave: onSave,
      onClose: onClose,
      isNew: true,
      onCreate: onSave,
      onDelete: onClose
    });
  }
}
