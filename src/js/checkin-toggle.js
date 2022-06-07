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
      deactivateAllButtons: { type: Boolean },
    };
  }

  set date(val) {
    const oldVal = this._date;
    this._date = val;
    this.requestUpdate('date', oldVal);
    this.refreshButtonState();
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
          @click="${handleClick(START)}"
          ?disabled=${deactivateAllButtons || activeButton === STOP}
        >
          Kommen
          <img src="icons/play_arrow-24px.svg" alt="einschalten" />
        </button>
        <button
          class="stop"
          @click="${handleClick(STOP)}"
          ?disabled=${deactivateAllButtons || activeButton === START}
        >
          Gehen
          <img src="icons/stop-24px.svg" alt="ausschalten" />
        </button>
      </div>
    `;
  }

  firstUpdated() {
    this.addEventListener('refresh', ({ detail }) => {
      this.refreshButtonState(detail);
    });
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

  refreshButtonState({ numRows, incomplete, unfilled } = {}) {
    // refresh due to time-pair update?
    if (typeof numRows === 'number') {
      // yes, set check-in button status according to whether the stop
      // time was filled in that time pair or not
      this.activeButton = !unfilled && incomplete ? STOP : START;
    }
    // for general refresh, ...
    if (!this.date) return;
    // ... just make sure buttons are only enabled if we are at today's date
    this.deactivateAllButtons = !sameDay(new Date(), new Date(this.date));
  }
}

customElements.define('checkin-toggle', CheckinToggle);
