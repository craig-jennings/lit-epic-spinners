import { html, LitElement } from '@polymer/lit-element';

export class FingerprintSpinner extends LitElement {
  static get is() { return 'fingerprint-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = '1.5';
    this.color = '#ff1d5e';
    this.size = '64px';
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

        .fingerprint-spinner {
          height: ${this.size};
          overflow: hidden;
          padding: 2px;
          position: relative;
          width: ${this.size};
        }

        .fingerprint-spinner .spinner-ring {
          animation: fingerprint-spinner-animation ${this.animationDuration}s cubic-bezier(0.680, -0.750, 0.265, 1.750) infinite forwards;
          border-bottom-color: transparent;
          border-left-color: transparent;
          border-radius: 50%;
          border-right-color: transparent;
          border-style: solid;
          border-top-color: ${this.color};
          border-width: 2px;
          bottom: 0;
          left: 0;
          margin: auto;
          position: absolute;
          right: 0;
          top: 0;
        }

        .fingerprint-spinner .spinner-ring:nth-child(1) {
          animation-delay: calc(50ms * 1);
          height: calc(${this.size} / 9 + 0 * ${this.size} / 9);
          width: calc(${this.size} / 9 + 0 * ${this.size} / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(2) {
          animation-delay: calc(50ms * 2);
          height: calc(${this.size} / 9 + 1 * ${this.size} / 9);
          width: calc(${this.size} / 9 + 1 * ${this.size} / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(3) {
          animation-delay: calc(50ms * 3);
          height: calc(${this.size} / 9 + 2 * ${this.size} / 9);
          width: calc(${this.size} / 9 + 2 * ${this.size} / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(4) {
          animation-delay: calc(50ms * 4);
          height: calc(${this.size} / 9 + 3 * ${this.size} / 9);
          width: calc(${this.size} / 9 + 3 * ${this.size} / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(5) {
          animation-delay: calc(50ms * 5);
          height: calc(${this.size} / 9 + 4 * ${this.size} / 9);
          width: calc(${this.size} / 9 + 4 * ${this.size} / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(6) {
          animation-delay: calc(50ms * 6);
          height: calc(${this.size} / 9 + 5 * ${this.size} / 9);
          width: calc(${this.size} / 9 + 5 * ${this.size} / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(7) {
          animation-delay: calc(50ms * 7);
          height: calc(${this.size} / 9 + 6 * ${this.size} / 9);
          width: calc(${this.size} / 9 + 6 * ${this.size} / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(8) {
          animation-delay: calc(50ms * 8);
          height: calc(${this.size} / 9 + 7 * ${this.size} / 9);
          width: calc(${this.size} / 9 + 7 * ${this.size} / 9);
        }

        .fingerprint-spinner .spinner-ring:nth-child(9) {
          animation-delay: calc(50ms * 9);
          height: calc(${this.size} / 9 + 8 * ${this.size} / 9);
          width: calc(${this.size} / 9 + 8 * ${this.size} / 9);
        }

        @keyframes fingerprint-spinner-animation {
          100% {
            transform: rotate( 360deg );
          }
        }
      </style>

      <div class="fingerprint-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
    `;
  }
}

customElements.define(FingerprintSpinner.is, FingerprintSpinner);
