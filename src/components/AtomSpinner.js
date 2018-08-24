import { html, LitElement } from '@polymer/lit-element';

export class AtomSpinner extends LitElement {
  static get is() { return 'atom-spinner'; }

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
    this.duration = 1;
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

        .atom-spinner {
          height: var(--atom-spinner-size, ${this.size}px);
          overflow: hidden;
          width: var(--atom-spinner-size, ${this.size}px);
        }

        .atom-spinner .spinner-inner {
          display: block;
          height: 100%;
          position: relative;
          width: 100%;
        }

        .atom-spinner .spinner-circle {
          color: var(--atom-spinner-color, ${this.color});
          display: block;
          font-size: calc(var(--atom-spinner-size, ${this.size}px) * 0.24);
          left: 50%;
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .atom-spinner .spinner-line {
          border-left: calc(var(--atom-spinner-size, ${this.size}px) / 25) solid var(--atom-spinner-color, ${this.color});
          border-radius: 50%;
          border-top: calc(var(--atom-spinner-size, ${this.size}px) / 25) solid transparent;
          height: 100%;
          position: absolute;
          width: 100%;
        }

        .atom-spinner .spinner-line:nth-child(1) {
          animation: atom-spinner-animation-1 var(--atom-spinner-duration, ${this.duration}s) linear infinite;
          transform: rotateZ(120deg) rotateX(66deg) rotateZ(0deg);
        }

        .atom-spinner .spinner-line:nth-child(2) {
          animation: atom-spinner-animation-2 var(--atom-spinner-duration, ${this.duration}s) linear infinite;
          transform: rotateZ(240deg) rotateX(66deg) rotateZ(0deg);
        }

        .atom-spinner .spinner-line:nth-child(3) {
          animation: atom-spinner-animation-3 var(--atom-spinner-duration, ${this.duration}s) linear infinite;
          transform: rotateZ(360deg) rotateX(66deg) rotateZ(0deg);
        }

        @keyframes atom-spinner-animation-1 {
          100% {
            transform: rotateZ(120deg) rotateX(66deg) rotateZ(360deg);
          }
        }

        @keyframes atom-spinner-animation-2 {
          100% {
            transform: rotateZ(240deg) rotateX(66deg) rotateZ(360deg);
          }
        }

        @keyframes atom-spinner-animation-3 {
          100% {
            transform: rotateZ(360deg) rotateX(66deg) rotateZ(360deg);
          }
        }
      </style>

      <div class="atom-spinner">
        <div class="spinner-inner">
          <div class="spinner-line"></div>
          <div class="spinner-line"></div>
          <div class="spinner-line"></div>

          <!--Chrome renders little circles malformed :(-->
          <div class="spinner-circle">&#9679;</div>
        </div>
      </div>
    `;
  }
}

customElements.define(AtomSpinner.is, AtomSpinner);
