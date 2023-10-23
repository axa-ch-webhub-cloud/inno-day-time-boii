import {
  css,
  html,
  LitElement,
} from 'https://cdn.jsdelivr.net/npm/lit@3.0.0/+esm';

import {
  nextDay,
  previousDay,
  sameDay,
  getDate,
  setDate,
  formatDate,
} from './date-manipulation.js';

import fireEvent from './custom-event.js';

class DateStepper extends LitElement {
  static get properties() {
    return {
      value: { type: String, reflect: true },
      _dateText: { type: String },
    };
  }

  set value(val) {
    const oldVal = this._value;
    this._value = val;
    this.requestUpdate('value', oldVal);
    this.setHelpText();
  }

  get value() {
    return this._value;
  }

  constructor() {
    super();

    if (this.value) {
      this.date = setDate(this.value);
    } else {
      this.date = getDate();
    }
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .container {
        display: flex;
        height: 75px;
        padding: 0 20px;
        justify-content: space-between;
        align-items: center;
        font-family: sans-serif;
        color: #333;
      }

      .date-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      p {
        margin: 0;
      }

      .helpText {
        margin-bottom: 3px;
        font-size: 14px;
        font-weight: bold;
      }

      .date {
        font-size: 16px;
      }

      button {
        padding: 0;
        background: none;
        border: none;
        outline: none;
        cursor: pointer;
      }

      button img {
        vertical-align: middle;
      }
    `;
  }

  render() {
    const { _dateText, date } = this;

    const helpText = _dateText
      ? html` <p class="helpText">${_dateText}</p> `
      : '';

    return html`
      <div class="container">
        <button class="previous" @click="${this.navigate}">
          <img
            class="previous"
            src="icons/keyboard_arrow_left-24px.svg"
            alt="zurück"
          />
        </button>
        <div class="date-wrapper">
          ${helpText}
          <p class="date">${formatDate(date)}</p>
        </div>
        <button @click="${this.navigate}">
          <img src="icons/keyboard_arrow_right-24px.svg" alt="weiter" />
        </button>
      </div>
    `;
  }

  // fire the initial date so that the other components know
  firstUpdated() {
    fireEvent('change', { date: this.date }, this);

    this.setHelpText();

    setInterval(() => {
      this.setHelpText();
    }, 29000); // refresh every half minute - 1 second
  }

  navigate({ target }) {
    if (target.classList.contains('previous')) {
      previousDay();
    } else {
      nextDay();
    }

    this.date = getDate();
    this.value = this.date.toString();
    fireEvent('change', { date: this.date }, this);
  }

  setHelpText() {
    let { date } = this;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (sameDay(today, date)) {
      this._dateText = 'Heute';
    } else if (sameDay(yesterday, date)) {
      this._dateText = 'Gestern';
    } else if (sameDay(tomorrow, date)) {
      this._dateText = 'Morgen';
    } else {
      this._dateText = '';
    }
  }
}

customElements.define('date-stepper', DateStepper);
