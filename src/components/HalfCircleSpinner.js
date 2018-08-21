import { html, LitElement } from '@polymer/lit-element';

class HalfCircleSpinner extends LitElement {
  static get is() { return 'half-circle-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = 1;
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

       .half-circle-spinner {
          border-radius: 100%;
          height: ${this.size};
          position: relative;
          width: ${this.size};
        }

        .half-circle-spinner .circle {
          border-radius: 100%;
          border: calc(${this.size} / 10) solid transparent;
          content: "";
          height: 100%;
          position: absolute;
          width: 100%;
        }

        .half-circle-spinner .circle.circle-1 {
          animation: half-circle-spinner-animation ${this.animationDuration}s infinite;
          border-top-color: ${this.color};
        }

        .half-circle-spinner .circle.circle-2 {
          animation: half-circle-spinner-animation ${this.animationDuration}s infinite alternate;
          border-bottom-color: ${this.color};
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
