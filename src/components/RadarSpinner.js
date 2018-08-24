import { html, LitElement } from '@polymer/lit-element';

export class RadarSpinner extends LitElement {
  static get is() { return 'radar-spinner'; }

  static get properties() {
    return {
      color: String,
      duration: Number,
      size: Number,
    };
  }

  constructor() {
    super();

    this.color = '#ff1d5e';
    this.duration = 2;
    this.size = 60;
  }

  _render() {
    return html`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .radar-spinner {
          height: var(--radar-spinner-size, ${this.size}px);
          position: relative;
          width: var(--radar-spinner-size, ${this.size}px);
        }

        .radar-spinner .circle {
          animation: radar-spinner-animation var(--radar-spinner-duration, ${this.duration}s) infinite;
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
        }

        .radar-spinner .circle:nth-child(1) {
          animation-delay: calc(var(--radar-spinner-duration, ${this.duration}s) / 6.67);
          padding: calc(var(--radar-spinner-size, ${this.size}px) * 5 * 2 * 0 / 110);
        }

        .radar-spinner .circle:nth-child(2) {
          animation-delay: calc(var(--radar-spinner-duration, ${this.duration}s) / 6.67);
          padding: calc(var(--radar-spinner-size, ${this.size}px) * 5 * 2 * 1 / 110);
        }

        .radar-spinner .circle:nth-child(3) {
          animation-delay: calc(var(--radar-spinner-duration, ${this.duration}s) / 6.67);
          padding: calc(var(--radar-spinner-size, ${this.size}px) * 5 * 2 * 2 / 110);
        }

        .radar-spinner .circle:nth-child(4) {
          animation-delay: 0ms;
          padding: calc(var(--radar-spinner-size, ${this.size}px) * 5 * 2 * 3 / 110);
        }

        .radar-spinner .circle-inner, .radar-spinner .circle-inner-container {
          border-radius: 50%;
          border: calc(var(--radar-spinner-size, ${this.size}px) * 5 / 110) solid transparent;
          height: 100%;
          width: 100%;
        }

        .radar-spinner .circle-inner {
          border-left-color: var(--radar-spinner-color, ${this.color});
          border-right-color: var(--radar-spinner-color, ${this.color});
        }

        @keyframes radar-spinner-animation {
          50%  { transform: rotate(180deg); }
          100% { transform: rotate(0deg); }
        }
      </style>

      <div class="radar-spinner">
        <div class="circle">
          <div class="circle-inner-container">
            <div class="circle-inner"></div>
          </div>
        </div>

        <div class="circle">
          <div class="circle-inner-container">
            <div class="circle-inner"></div>
          </div>
        </div>

        <div class="circle">
          <div class="circle-inner-container">
            <div class="circle-inner"></div>
          </div>
        </div>

        <div class="circle">
          <div class="circle-inner-container">
            <div class="circle-inner"></div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define(RadarSpinner.is, RadarSpinner);
