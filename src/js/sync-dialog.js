import {
  css,
  html,
  LitElement,
} from 'https://unpkg.com/lit-element/lit-element.js?module';

import fireEvent from './custom-event.js';
import './p2p-sync.js';

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

const handleSuccess = (e) => {
  const { currentTarget, detail } = e;
  const element = currentTarget.querySelector(`.${detail}`);
  element.classList.add('success');
  setTimeout(() => element.classList.remove('success'), SUCCESS_UI_TIMEOUT);
};

// Custom Element
class SyncDialog extends LitElement {
  static get properties() {
    return {
      open: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this.open = false;
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
        grid-template-columns: 1fr 1fr;
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
    const { open, close } = this;

    return open
      ? html` <div>
          <article @success="${handleSuccess}">
            <button class="close" @click="${close}" title="Abbrechen">
              ${closeIcon}
            </button>
            <p2p-sync></p2p-sync>
          </article>
        </div>`
      : html``;
  }

  close() {
    fireEvent('close', null, this);
  }
}

customElements.define('sync-dialog', SyncDialog);
