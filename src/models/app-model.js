import Observable from '../framework/observable.js';

export default class AppModel extends Observable {
  #openedForm = null;

  get openedForm() {
    return this.#openedForm;
  }

  openEditForm(id) {
    this.#openForm({
      type: 'edit',
      id,
    });
  }

  openCreateForm() {
    this.#openForm({
      type: 'create',
    });
  }

  closeForm() {
    const closedForm = this.#openedForm;

    this.#openedForm = null;

    this._notify('CLOSE', {
      closed: closedForm,
    });
  }

  #openForm(form) {
    const closedForm = this.#openedForm;

    this.#openedForm = form;

    this._notify('OPEN', {
      closed: closedForm,
      opened: this.#openedForm,
    });
  }
}
