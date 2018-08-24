import { html, LitElement } from '@polymer/lit-element';

export class HalfCircleSpinner extends LitElement {
  static get is() { return 'half-circle-spinner'; }

  static get properties() {
    return {
      color: String,
      duration: Number,
      size: Number,
    };
  }

  constructor() {
    super();

    this.duration = 1;
    this.color = '#ff1d5e';
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

       .half-circle-spinner {
          border-radius: 100%;
          height: var(--half-circle-spinner-size, ${this.size}px);
          position: relative;
          width: var(--half-circle-spinner-size, ${this.size}px);
        }

        .half-circle-spinner .circle {
          border-radius: 100%;
          border: calc(var(--half-circle-spinner-size, ${this.size}px) / 10) solid transparent;
          content: "";
          height: 100%;
          position: absolute;
          width: 100%;
        }

        .half-circle-spinner .circle.circle-1 {
          animation: half-circle-spinner-animation var(--half-circle-spinner-duration, ${this.duration}s) infinite;
          border-top-color: var(--half-circle-spinner-color, ${this.color});
        }

        .half-circle-spinner .circle.circle-2 {
          animation: half-circle-spinner-animation var(--half-circle-spinner-duration, ${this.duration}s) infinite alternate;
          border-bottom-color: var(--half-circle-spinner-color, ${this.color});
        }

        @keyframes half-circle-spinner-animation {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>

      <div class="half-circle-spinner">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
      </div>
    `;
  }
}

customElements.define(HalfCircleSpinner.is, HalfCircleSpinner);
