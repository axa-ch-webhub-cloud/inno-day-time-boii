import {
  css,
  html,
  LitElement,
} from 'https://cdn.jsdelivr.net/npm/lit@3.0.0/+esm';
import {
  addTimeEvent,
  append,
  COMING,
  decimal2HoursMinutes,
  deleteTimePair,
  EMPTY,
  getTimePairs,
  GOING,
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
    // remove stuff that's just designed to make the value unique for purposes of forcing a re-render
    // (a performance.now() numeric timestamp)
    value = value.replace(/[\d.]/g, '');
    // filter out invalid values
    if (!/^(?:start|stop)$/.test(value)) {
      return;
    }
    const { numRows, row } = this.state || {
      numRows: 0,
      row: 0,
    };
    // start: fill a start field
    // stop: fill a stop field
    const isStart = value === 'start';
    const which = isStart ? COMING : GOING;
    const where = row < numRows ? row : append;
    addTimeEvent(which, where).then(
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

    this.focussable = true;
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
          return html``;
        }

        const { round, floor } = Math;
        let text = `${round(pause * 60)} min Pause`;

        if (pause > 1) {
          text = `${floor(pause).toString().padStart(2, '0')} h ${round(
            60 * (pause - floor(pause))
          )
            .toString()
            .padStart(2, '0')} min Pause`;
        }

        return html` <li class="row pause">${text}</li> `;
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
                    autofocus
                    class="start"
                    type="time"
                    .value="${decimal2HoursMinutes(start)}"
                    @change="${handleRowAction}"
                    data-index="${index}"
                  /><span>-</span
                  ><input
                    class="stop"
                    type="time"
                    .value="${decimal2HoursMinutes(stop)}"
                    @change="${handleRowAction}"
                    data-index="${index}"
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
    // let others know we re-rendered,
    // and whether a row has a missing stop time
    // a.k.a. an 'incomplete' time pair,
    // or even an entirely 'unfilled' row, missing a start time
    const { items = [] } = this;
    let row, incomplete, unfilled;
    const numRows = items.length;
    // for all rows from top to bottom:
    for (row = 0; row < numRows; row++) {
      // get current time pair parts
      const currentItem = items[row];
      const stopTime = Array.isArray(currentItem) && currentItem[GOING];
      const startTime = Array.isArray(currentItem) && currentItem[COMING];
      // calculate its salient row properties
      incomplete = Number.isNaN(parseFloat(stopTime));
      unfilled = Number.isNaN(parseFloat(startTime));
      // stop at first-from-the-top row that is not completely filled
      if (incomplete || unfilled) break;
    }
    this.state = { numRows, row, incomplete, unfilled };
    // 'let others know': fire an event on ourselves (this) that others can subscribe to
    customEvent('change', this.state, this);

    // focus on the appropriate input field, using the salient properties determined above
    if (!this.focussable) return;

    const focusSelector =
      numRows < 1
        ? '*'
        : unfilled
        ? `input.start[data-index="${row}"]`
        : incomplete
        ? `input.stop[data-index="${row}"]`
        : '.start';

    setTimeout(() => {
      const focusNode = this.shadowRoot.querySelector(focusSelector);
      if (focusNode && this.focussable) focusNode.focus();
    }, 1);
  }

  dontStealFocusAfterKeyboardInput() {
    this.focussable = false;
    setTimeout(() => (this.focussable = true), 100);
  }

  async handleRowAction({ target }) {
    const rowIndex = target.parentNode.dataset.index;
    const { value, className } = target;

    switch (className) {
      case 'start':
        this.items = await addTimeEvent(COMING, rowIndex, value);
        this.dontStealFocusAfterKeyboardInput();
        break;
      case 'stop':
        this.items = await addTimeEvent(GOING, rowIndex, value);
        this.dontStealFocusAfterKeyboardInput();
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
