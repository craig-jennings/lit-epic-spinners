import { html, LitElement } from '@polymer/lit-element';

export class RadarSpinner extends LitElement {
  static get is() { return 'radar-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = 2;
    this.color = '#ff1d5e';
    this.size = '60px';
  }

  _render() {
    return html`
      <style>
        :host {
          display: block;
        }

        * {
          box-sizing: border-box;
        }

       .radar-spinner {
          height: ${this.size};
          position: relative;
          width: ${this.size};
        }

        .radar-spinner .circle {
          animation: radar-spinner-animation ${this.animationDuration}s infinite;
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
        }

        .radar-spinner .circle:nth-child(1) {
          animation-delay: 300ms;
          padding: calc(${this.size} * 5 * 2 * 0 / 110);
        }

        .radar-spinner .circle:nth-child(2) {
          animation-delay: 300ms;
          padding: calc(${this.size} * 5 * 2 * 1 / 110);
        }

        .radar-spinner .circle:nth-child(3) {
          animation-delay: 300ms;
          padding: calc(${this.size} * 5 * 2 * 2 / 110);
        }

        .radar-spinner .circle:nth-child(4) {
          animation-delay: 0ms;
          padding: calc(${this.size} * 5 * 2 * 3 / 110);
        }

        .radar-spinner .circle-inner, .radar-spinner .circle-inner-container {
          border-radius: 50%;
          border: calc(${this.size} * 5 / 110) solid transparent;
          height: 100%;
          width: 100%;
        }

        .radar-spinner .circle-inner {
          border-left-color: ${this.color};
          border-right-color: ${this.color};
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
