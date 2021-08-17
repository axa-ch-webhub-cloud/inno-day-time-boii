import {
  css,
  html,
  LitElement,
} from 'https://unpkg.com/lit-element/lit-element.js?module';
import {
  dailyHours,
  decimal2HoursMinutes,
  getTimePairs,
  human2decimalTime,
} from './date-manipulation.js';

class TimeManager extends LitElement {
  static get properties() {
    return {
      date: { type: String },
      //internal props:
      workedHours: { type: Number },
      endTime: { type: Number },
    };
  }

  static get styles() {
    return css`
      :host {
        font-family: sans-serif;
        color: #333;
      }

      .info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0 20px;
        padding: 15px 20px;
        font-size: 20px;
        background-color: #f2f2f2;
        white-space: nowrap;
        border-radius: 2px;
      }

      img {
        width: 25px;
        vertical-align: bottom;
      }
    `;
  }

  constructor() {
    super();

    //init
    this.workedHours = 0;
    this.endTime = 0;

    // install event handler
    this.addEventListener('refresh', () => this.refresh(), false);
  }

  set date(dateString) {
    this._date = dateString;
    this.refresh();
  }

  get date() {
    return this._date;
  }

  async setWorkedHours() {
    // set up
    const storedTimes = await getTimePairs('time-pairs-only');
    const hasPairs = storedTimes.length > 0;
    let newWorkedHours = 0;
    let pauses = 0;
    const currentTimeNow = human2decimalTime();
    // if there is at least one stored time pair, we can take the
    // day's start time from it, otherwise we use the current time
    this.dayStart = hasPairs ? storedTimes[0][0] : currentTimeNow;
    let lastStopTime = this.dayStart;
    // things look valid?
    if (hasPairs && !isNaN(this.dayStart)) {
      // yes, assume the best...
      let incompleteLastTimeTinterval = false;
      // and iterate over all stored time pairs:
      for (let [startTime, stopTime] of storedTimes) {
        // valid start time?
        if (isNaN(startTime)) continue; // no, so skip this time interval

        // valid stop time?
        if (isNaN(stopTime)) {
          // no, fill with current time now
          stopTime = currentTimeNow;
          // and notice that fact
          incompleteLastTimeTinterval = true;
        }

        // add time interval length to worked hours so far
        newWorkedHours += stopTime - startTime;

        // calculate pause increment
        pauses += startTime - lastStopTime;
        // lag stop time
        lastStopTime = stopTime;

        // ensure incomplete time interval is really the last one
        // (by ignoring anything after that, seeing it as mysteriously broken state)
        if (incompleteLastTimeTinterval) break;
      }
    }
    // transfer to instance variables
    this.workedHours = newWorkedHours;
    this.pauses = pauses;
  }

  setEndtime() {
    // get prescribed daily hours (from settings)
    dailyHours().then(hours => {
      // calculate end-of-work time
      // N.B. Avoiding reference to current time ('now') in the calculation
      // prevents wrong results in case of on-device clock skew
      const { dayStart = 0, pauses = 0 } = this;
      this.endTime = dayStart + hours + pauses;
    });
  }

  refresh() {
    this.setWorkedHours();
    this.setEndtime();
  }

  firstUpdated() {
    this.refresh();

    setInterval(() => {
      this.refresh();
    }, 29000); // refresh every half minute - 1 second
  }

  render() {
    return html`
      <section>
        <p class="info">
          <span>
            <img src="icons/hourglass_bottom-24px.svg" />
            ${decimal2HoursMinutes(this.workedHours)}
          </span>
          <span
            ><img src="icons/directions_run-24px.svg" /> ${decimal2HoursMinutes(
              this.endTime
            )}</span
          >
        </p>
      </section>
    `;
  }
}

customElements.define('time-manager', TimeManager);
