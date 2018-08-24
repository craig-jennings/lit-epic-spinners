import { html, LitElement } from '@polymer/lit-element';

export class FulfillingBouncingCircleSpinner extends LitElement {
  static get is() { return 'fulfilling-bouncing-circle-spinner'; }

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
    this.duration = 4;
    this.size = 50;
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

        .fulfilling-bouncing-circle-spinner {
          animation: fulfilling-bouncing-circle-spinner-animation infinite var(--fulfilling-bouncing-circle-spinner-duration, ${this.duration}s) ease;
          height: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
          position: relative;
          width: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
        }

        .fulfilling-bouncing-circle-spinner .orbit {
          animation: fulfilling-bouncing-circle-spinner-orbit-animation infinite var(--fulfilling-bouncing-circle-spinner-duration, ${this.duration}s) ease;
          border-radius: 50%;
          border: calc(var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px) * 0.03) solid var(--fulfilling-bouncing-circle-spinner-color, ${this.color});
          height: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
          left: 0;
          position: absolute;
          top: 0;
          width: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
        }

        .fulfilling-bouncing-circle-spinner .circle {
          animation: fulfilling-bouncing-circle-spinner-circle-animation infinite var(--fulfilling-bouncing-circle-spinner-duration, ${this.duration}s) ease;
          border-radius: 50%;
          border: calc(var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px) * 0.1) solid var(--fulfilling-bouncing-circle-spinner-color, ${this.color});
          color: var(--fulfilling-bouncing-circle-spinner-color, ${this.color});
          display: block;
          height: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
          position: relative;
          transform: rotate(0deg) scale(1);
          width: var(--fulfilling-bouncing-circle-spinner-size, ${this.size}px);
        }

        @keyframes fulfilling-bouncing-circle-spinner-animation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes fulfilling-bouncing-circle-spinner-orbit-animation {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1);
          }
          62.5% {
            transform: scale(0.8);
          }
          75% {
            transform: scale(1);
          }
          87.5% {
            transform: scale(0.8);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes fulfilling-bouncing-circle-spinner-circle-animation {
          0% {
            border-bottom-color: transparent;
            border-left-color: transparent;
            border-right-color: transparent;
            border-top-color: inherit;
            transform: scale(1);
          }

          16.7% {
            border-bottom-color: transparent;
            border-left-color: transparent;
            border-right-color: initial;
            border-top-color: initial;
          }

          33.4% {
            border-bottom-color: inherit;
            border-left-color: transparent;
            border-right-color: inherit;
            border-top-color: inherit;
          }

          50% {
            border-color: inherit;
            transform: scale(1);
          }

          62.5% {
            border-color: inherit;
            transform: scale(1.4);
          }

          75% {
            border-color: inherit;
            opacity: 1;
            transform: scale(1);
          }

          87.5% {
            border-color: inherit;
            transform: scale(1.4);
          }

          100% {
            border-color: transparent;
            border-top-color: inherit;
            transform: scale(1);
          }
        }
      </style>

      <div class="fulfilling-bouncing-circle-spinner">
        <div class="circle"></div>
        <div class="orbit"></div>
      </div>
    `;
  }
}

customElements.define(FulfillingBouncingCircleSpinner.is, FulfillingBouncingCircleSpinner);
