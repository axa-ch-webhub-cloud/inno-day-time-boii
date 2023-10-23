import {
  css,
  html,
  LitElement,
} from 'https://cdn.jsdelivr.net/npm/lit@3.0.0/+esm';

import fireEvent from './custom-event.js';
import { dailyHours } from './date-manipulation.js';
import {
  exportToJSONFile,
  importFromJSONFile,
  eventTarget,
} from './import-export.js';

// constants
const SUCCESS_UI_TIMEOUT = 3000; // milliseconds

// helper functions
const closeIcon = html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 0 24 24"
    width="24"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
    />
  </svg>
`;

const verifiedIcon = aClass => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    enable-background="new 0 0 24 24"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    class="${aClass}"
  >
    <g><rect fill="none" height="24" width="24" /></g>
    <g>
      <path
        d="M23,12l-2.44-2.79l0.34-3.69l-3.61-0.82L15.4,1.5L12,2.96L8.6,1.5L6.71,4.69L3.1,5.5L3.44,9.2L1,12l2.44,2.79l-0.34,3.7 l3.61,0.82L8.6,22.5l3.4-1.47l3.4,1.46l1.89-3.19l3.61-0.82l-0.34-3.69L23,12z M10.09,16.72l-3.8-3.81l1.48-1.48l2.32,2.33 l5.85-5.87l1.48,1.48L10.09,16.72z"
      />
    </g>
  </svg>
`;

const handleSuccess = e => {
  const { currentTarget, detail } = e;
  const element = currentTarget.querySelector(`.${detail}`);
  element.classList.add('success');
  setTimeout(() => element.classList.remove('success'), SUCCESS_UI_TIMEOUT);
};

// Custom Element
class SettingsDialog extends LitElement {
  static get properties() {
    return {
      hoursPerDay: { type: Number },
      open: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this.open = false;
    (async () => {
      this.hoursPerDay = await dailyHours();
    })();
    this.close = this.close.bind(this);
  }

  static get styles() {
    return css`
      div {
        display: flex;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        justify-content: center;
        align-items: center;
        background: rgba(0, 0, 0, 0.4);
      }

      article {
        display: grid;
        grid-template-columns: 4fr 1fr;
        grid-template-rows: repeat(3, 1fr);
        grid-column-gap: 0px;
        grid-row-gap: 0px;
        position: relative;
        width: 100%;
        max-width: 400px;
        margin: 20px;
        padding: 30px 20px 20px 20px;
        background: #ffffff;
        box-shadow: 0px 0 4px rgba(0, 0, 0, 0.25);
        border-radius: 2px;
      }

      svg {
        visibility: hidden;
        justify-self: center;
        align-self: center;
      }

      svg.success {
        visibility: visible;
        fill: #14e014;
        height: 38px;
        width: 38px;
        animation: fadeIn 1.5s ease-in;
      }

      @keyframes fadeIn {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }

      label {
        display: flex;
        flex-direction: column;
        place-self: flex-start;
        font-size: 14px;
        font-weight: bold;
      }

      input {
        width: 100%;
        margin: 10px 0 15px;
        padding: 10px 20px;
        box-sizing: border-box;
        border: 1px solid #cccccc;
        font-size: 14px;
      }

      button {
        height: 38px;
        margin: 0 5px 0 0;
        padding: 10px 20px;
        background: #00008f;
        border: none;
        outline: none;
        text-transform: uppercase;
        color: #ffffff;
        cursor: pointer;
        border-radius: 2px;
        justify-self: center;
        align-self: center;
      }

      .close {
        position: absolute;
        top: 5px;
        right: 5px;
        background: none;
        margin: 0;
        padding: 10px;
        opacity: 0.5;
      }

      .close svg {
        visibility: visible;
      }

      .export {
        margin-top: 10px;
      }
    `;
  }

  render() {
    const { hoursPerDay, open, storeHoursPerDay, close } = this;

    return open
      ? html`
          <div>
            <article @success="${handleSuccess}">
              <label>
                Sollarbeitszeit (h/Tag)
                <input
                  type="text"
                  class="daily"
                  value=${hoursPerDay}
                  @input=${storeHoursPerDay}
                />
              </label>
              <button class="close" @click="${close}" title="Abbrechen">
                ${closeIcon}
              </button>
              ${verifiedIcon('hours')}
              <label>
                Backup importieren
                <input
                  type="file"
                  title="Datei wählen"
                  accept=".json, application/json"
                  @change="${importFromJSONFile}"
                />
              </label>
              ${verifiedIcon('imported')}
              <label>
                Backup exportieren
                <button class="export" @click="${exportToJSONFile}">
                  Jetzt exportieren
                </button>
              </label>
              ${verifiedIcon('exported')}
            </article>
          </div>
        `
      : html``;
  }

  close() {
    fireEvent('close', null, this);
  }

  async storeHoursPerDay(e) {
    // set up
    const { hoursPerDay } = this;
    // get daily hours from input
    const dailyString = this.shadowRoot.querySelector('.daily').value;
    // try to convert it
    const newDaily = parseFloat(dailyString);
    // valid format and different?
    if (isFinite(newDaily) && hoursPerDay !== newDaily) {
      // yes, update and persist it
      this.hoursPerDay = await dailyHours(newDaily);
      // tell UI about our success
      fireEvent('success', 'hours', eventTarget(e));
    }
  }
}

customElements.define('settings-dialog', SettingsDialog);
