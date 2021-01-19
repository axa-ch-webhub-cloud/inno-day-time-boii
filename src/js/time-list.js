import {
  css,
  html,
  LitElement,
} from 'https://unpkg.com/lit-element/lit-element.js?module';
import {
  addTimeEvent,
  append,
  COMING,
  decimal2HoursMinutes,
  deleteTimePair,
  EMPTY,
  getTimePairs,
  GOING,
  last,
  setDate,
} from './date-manipulation.js';
import customEvent from './custom-event.js';

class TimeList extends LitElement {
  static get properties() {
    return {
      items: { type: Array },
      date: { type: Object },
    };
  }

  set date(aDate) {
    this._date = setDate(aDate);

    (async () => {
      this.items = await getTimePairs('time-pairs-only');
    })();
  }

  get date() {
    return this._date;
  }

  set startStop(value) {
    // filter out invalid values
    if (!/^(?:start|stop)$/.test(value)) {
      return;
    }
    const isStart = value === 'start';
    // start: create a new time-pair row
    // stop: fill second part of the last time-pair row
    addTimeEvent(isStart ? COMING : GOING, isStart ? append : last).then(
      // then: setters can't be async
      updatedItems => {
        this.items = updatedItems; // this triggers a re-render
      }
    );
  }

  static get styles() {
    return css`
      :host {
        font-family: sans-serif;
        color: #333;
      }

      section {
        margin: 20px 20px 0;
      }

      details,
      summary {
        outline: none;
        font-size: 16px;
        font-weight: bold;
      }

      ol {
        margin: 20px 0 0;
        padding: 5px;
        background: #f2f2f2;
        border-radius: 2px;
      }

      .row {
        display: flex;
        margin: 10px;
        align-items: center;
      }

      .row input {
        flex: 1;
        padding: 10px;
        box-sizing: border-box;
        border: 1px solid #cccccc;
        font-size: 14px;
      }

      .row span {
        margin: 0 10px;
        font-weight: bold;
      }

      .pause {
        padding: 10px;
        justify-content: center;
        font-size: 14px;
      }

      .delete {
        margin-left: 5px;
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
      }

      .delete img {
        width: 25px;
        vertical-align: middle;
      }

      .rowplus {
        display: flex;
        justify-content: center;
        padding: 10px 10px 15px;
      }

      .add {
        height: 40px;
        width: 40px;
        padding: 0;
        border-radius: 50%;
        border: none;
        background: #00008f;
        cursor: pointer;
      }

      .add img {
        width: 25px;
        vertical-align: middle;
      }
    `;
  }

  constructor() {
    super();

    (async () => {
      this.items = await getTimePairs('time-pairs-only');
    })();
  }

  render() {
    const { items = [], handleRowAction, handleAdd } = this;

    const calculatePause = index => {
      const nextIndex = index + 1;

      if (nextIndex >= items.length) {
        return;
      }

      const pauseStart = items[index][1];
      const pauseStop = items[nextIndex][0];

      if (pauseStart !== undefined && pauseStop !== undefined) {
        const pause = pauseStop - pauseStart;

        if (pause <= 0) {
          return;
        }

        const { round, floor } = Math;
        let text = `${round(pause * 60)} min Pause`;

        if (pause > 1) {
          text = `${floor(pause)
            .toString()
            .padStart(2, '0')} h ${round(60 * (pause - floor(pause)))
            .toString()
            .padStart(2, '0')} min Pause`;
        }

        return html`
          <li class="row pause">${text}</li>
        `;
      }
    };

    return html`
      <section>
        <details open>
          <summary>Eingetragene Zeiten</summary>
          <ol>
            ${items.map(
              ([start, stop], index) => html`
                <li class="row" data-index="${index}">
                  <input
                    class="start"
                    type="time"
                    .value="${decimal2HoursMinutes(start)}"
                    @change="${handleRowAction}"
                  /><span>-</span
                  ><input
                    class="stop"
                    type="time"
                    .value="${decimal2HoursMinutes(stop)}"
                    @change="${handleRowAction}"
                  /><button
                    class="delete"
                    @click="${handleRowAction}"
                    data-index="${index}"
                  >
                    <img class="delete" src="icons/delete-24px.svg" />
                  </button>
                </li>
                ${calculatePause(index)}
              `
            )}
            <li class="rowplus">
              <button class="add" @click="${handleAdd}">
                <img class="add" src="icons/add-24dp.svg" />
              </button>
            </li>
          </ol>
        </details>
      </section>
    `;
  }

  updated() {
    // let others know we re-rendered
    customEvent('change', null, this);
  }

  async handleRowAction({ target }) {
    const rowIndex = target.parentNode.dataset.index;
    const { value, className } = target;

    switch (className) {
      case 'start':
        this.items = await addTimeEvent(COMING, rowIndex, value);
        break;
      case 'stop':
        this.items = await addTimeEvent(GOING, rowIndex, value);
        break;
      case 'delete':
        this.items = await deleteTimePair(rowIndex);
        break;
    }
  }

  async handleAdd() {
    this.items = await addTimeEvent(EMPTY, append);
  }
}

customElements.define('time-list', TimeList);
