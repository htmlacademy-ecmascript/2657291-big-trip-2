import { render, replace } from '../framework/render.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import PointPresenter from './point-presenter.js';
import { filter } from '../common/filter.js';
import EmptyView from '../view/empty-view.js';
import { updateItem } from '../common/utils.js';
import FormEditView from '../view/point/form-edit-view.js';
import { isEscape } from '../common/utils.js';

export default class BoardPresenter {
  #filterComponent = null;
  #sortComponent = null;
  #pointList = new PointListView();
  #allPoints = [];
  #sourcedPoints = [];
  #currentSortType = 'day';
  #filterContainer = null;
  #contentContainer = null;
  #pointModel = null;
  #filterModel = null;
  #pointPresenters = new Map();
  #addFormView = null;

  constructor({ filterContainer, contentContainer, pointModel, filterModel }) {
    this.#filterContainer = filterContainer;
    this.#contentContainer = contentContainer;
    this.#pointModel = pointModel;
    this.#filterModel = filterModel;
  }

  init() {
    this.#allPoints = [...this.#pointModel.points];
    this.#sourcedPoints = [...this.#pointModel.points];
    this.#renderBoard();
  }

  #sortPoints(sortType) {
    switch (sortType) {
      case 'price':
        this.#allPoints.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'time':
        this.#allPoints.sort((a, b) => {
          const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
          const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
          return durationB - durationA;
        });
        break;
      case 'day':
      default:
        this.#allPoints = [...this.#sourcedPoints];
        break;
    }
    this.#currentSortType = sortType;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortPoints(sortType);

    this.#updateSort();
    this.renderPoints();
  };

  #renderSort() {
    this.#sortComponent = new SortView({
      onSortChange: this.#handleSortTypeChange,
      currentSortType: this.#currentSortType
    });
    render(this.#sortComponent, this.#contentContainer);
  }

  #renderBoard() {
    this.#renderSort();
    render(this.#pointList, this.#contentContainer);
    this.renderPoints();
  }

  renderPoints() {
    this.#pointList.element.innerHTML = '';

    const currentFilter = this.#filterModel.filter;

    const filteredPoints = filter[currentFilter](this.#allPoints);

    // Если точек нет — показываем заглушку
    if (filteredPoints.length === 0) {
      const emptyView = new EmptyView({
        filterType: currentFilter
      });
      render(emptyView, this.#pointList.element);
      return;
    }

    this.#clearPointPresenters();

    // Рендерим каждую отфильтрованную точку
    filteredPoints.forEach((point) => {
      const pointPresenter = new PointPresenter({
        point,
        model: this.#pointModel,
        container: this.#pointList.element,
        onFormOpen: this.#handleFormOpen,
        onPointChange: this.#handlePointChange,
        onDelete: this.#deletePoint,
      });
      pointPresenter.init();
      this.#pointPresenters.set(point.id, pointPresenter);
    });
  }

  #clearPointPresenters() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #handleFormOpen = () => {
    this.#resetAllForms();
  };

  #resetAllForms() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  }

  #handlePointChange = (updatedPoint) => {
    this.#pointModel.updatePoint(updatedPoint);
    // Обновляем данные в массиве
    this.#allPoints = updateItem(this.#allPoints, updatedPoint);

    this.#sourcedPoints = updateItem(this.#sourcedPoints, updatedPoint);

    // Обновляем презентер
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #updateSort() {
    const newSortComponent = new SortView({
      onSortChange: this.#handleSortTypeChange,
      currentSortType: this.#currentSortType
    });

    if (this.#sortComponent) {
    // Если старый есть — заменяем его на новый
      replace(newSortComponent, this.#sortComponent);
    } else {
    // Если старого нет — рендерим как обычно
      render(newSortComponent, this.#contentContainer);
    }

    this.#sortComponent = newSortComponent;
  }

  #handlePointAdd = (newPoint) => {
    this.#pointModel.addPoint(newPoint);
    this.#allPoints = [...this.#pointModel.points];
    this.#sourcedPoints = [...this.#pointModel.points];
    this.#closeAddForm();
    this.renderPoints();
  };

  #openAddForm() {
    // Сброс фильтра
    this.#filterModel.setFilter('everything');
    // Сброс сортировки
    this.#currentSortType = 'day';
    this.#sortPoints('day');
    this.#updateSort();
    // Закрыть все открытые формы
    this.#resetAllForms();

    const blankPoint = {
      id: crypto.randomUUID(),
      type: 'flight',
      basePrice: 0,
      dateFrom: new Date().toISOString(),
      dateTo: new Date().toISOString(),
      destination: '',
      offers: [],
      isFavorite: false,
    };

    this.#addFormView = new FormEditView({
      point: blankPoint,
      offers: [],
      destinationName: '',
      description: '',
      pictures: [],
      destinations: this.#pointModel.destinations,
      pointModel: this.#pointModel,
      onSave: null,
      onClose: () => this.#closeAddForm(),
      isNew: true,
      onCreate: this.#handlePointAdd,
    });

    render(this.#addFormView, this.#pointList.element, 'afterbegin');
    document.addEventListener('keydown', this.#onAddFormEscKeydown);
  }

  #closeAddForm() {
    if (this.#addFormView) {
      this.#addFormView.removeElement();
      this.#addFormView = null;
      document.removeEventListener('keydown', this.#onAddFormEscKeydown);
    }
  }

  refreshPoints() {
    this.renderPoints();
  }

  #deletePoint = (pointId) => {
    // Удаляем точку из модели
    this.#pointModel.deletePoint(pointId);

    // Удаляем из #allPoints и #sourcedPoints
    this.#allPoints = this.#allPoints.filter((p) => p.id !== pointId);
    this.#sourcedPoints = this.#sourcedPoints.filter((p) => p.id !== pointId);

    // Удаляем презентер из Map
    this.#pointPresenters.delete(pointId);

    this.renderPoints();
  };

  createNewPoint() {
    this.#openAddForm();
  }

  resetSort() {
    this.#currentSortType = 'day';
    this.#sortPoints('day');
    this.#updateSort();
  }

  #onAddFormEscKeydown = (evt) => {
    if (isEscape(evt)) {
      evt.preventDefault();
      this.#closeAddForm();
    }
  };
}
