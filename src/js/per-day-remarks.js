import {
  css,
  html,
  LitElement,
} from 'https://unpkg.com/lit-element/lit-element.js?module';
import { getPerDayRemarks, setPerDayRemarks } from './date-manipulation.js';

class PerDayRemarks extends LitElement {
  static get properties() {
    return {
      date: { type: String },
      remarks: { type: String },
    };
  }

  set date(val) {
    getPerDayRemarks().then(remarks => {
      this.remarks = remarks;
    });
  }

  static get styles() {
    return css`
      section {
        margin: 20px 20px 0px;
      }

      details,
      summary {
        outline: none;
        font-size: 16px;
        font-weight: bold;
      }

      textarea {
        margin: 20px;
        margin-left: 0;
        width: calc(100% - 20px);
        outline: none;
        padding: 10px;
      }
    `;
  }

  render() {
    const { remarks = '' } = this;

    return html`
      <section>
        <details ?open="${remarks.trim().length}"
          ><summary>Bemerkungen</summary>
          <textarea
            .value="${remarks}"
            placeholder="Deine Bemerkungen hier.."
            @input="${this.handleInput}"
          ></textarea>
        </details>
      </section>
    `;
  }

  async handleInput(e) {
    const {
      target: { value: remarks },
    } = e;
    await setPerDayRemarks(remarks);
  }
}

customElements.define('per-day-remarks', PerDayRemarks);
