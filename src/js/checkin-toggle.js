import {
  css,
  html,
  LitElement,
} from 'https://unpkg.com/lit-element/lit-element.js?module';
import fireEvent from './custom-event.js';
import { sameDay } from './date-manipulation.js';

const START = 'start';
const STOP = 'stop';

class CheckinToggle extends LitElement {
  static get properties() {
    return {
      activeButton: { type: String },
      date: { type: String },
    };
  }

  set date(val) {
    const oldVal = this._date;
    this._date = val;
    this.requestUpdate('date', oldVal);
    this.disableButtonsIfNeeded();
  }

  get date() {
    return this._date;
  }

  constructor() {
    super();
    this.activeButton = START;
    this.deactivateAllButtons = false;
    this.handleClick = this.handleClick.bind(this);
  }

  static get styles() {
    return css`
      .container {
        display: flex;
        padding: 15px;
        background: #ffffff;
        color: #fff;
      }

      button {
        display: flex;
        flex: 1;
        height: 45px;
        margin: 5px;
        align-items: center;
        justify-content: center;
        border: none;
        background-color: #f2f2f2;
        font-size: 16px;
        color: #fff;
        outline: none;
        cursor: pointer;
        border-radius: 2px;
      }

      button[disabled] {
        cursor: unset;
        opacity: 0.2;
      }

      .start {
        background: #1a0082;
      }

      .stop {
        background: #f9205c;
      }
    `;
  }

  render() {
    const { activeButton, handleClick, deactivateAllButtons } = this;

    return html`
      <div class="container">
        <button
          class="start"
          @click="${handleClick('start')}"
          ?disabled=${deactivateAllButtons || activeButton === STOP}
        >
          Kommen
          <img src="icons/play_arrow-24px.svg" alt="einschalten" />
        </button>
        <button
          class="stop"
          @click="${handleClick('stop')}"
          ?disabled=${deactivateAllButtons || activeButton === START}
        >
          Gehen
          <img src="icons/stop-24px.svg" alt="ausschalten" />
        </button>
      </div>
    `;
  }

  firstUpdated() {
    setInterval(() => {
      this.disableButtonsIfNeeded();
    }, 29000); // refresh every half minute - 1 second
  }

  handleClick(oldState) {
    return (/* event unused here */) => {
      // toggle state
      const newState = oldState === START ? STOP : START;
      this.activeButton = newState;
      // notify parent(s)
      fireEvent('change', oldState, this);
    };
  }

  disableButtonsIfNeeded() {
    if (this.date) {
      if (sameDay(new Date(), new Date(this.date))) {
        this.deactivateAllButtons = false;
      } else {
        this.deactivateAllButtons = true;
      }
    }
  }
}

customElements.define('checkin-toggle', CheckinToggle);
