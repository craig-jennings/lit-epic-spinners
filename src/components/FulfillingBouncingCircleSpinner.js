import { html, LitElement } from '@polymer/lit-element';

class FulfillingBouncingCircleSpinner extends LitElement {
  static get is() { return 'fulfilling-bouncing-circle-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = 4;
    this.color = '#ff1d5e';
    this.size = '50px';
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

        .fulfilling-bouncing-circle-spinner {
          animation: fulfilling-bouncing-circle-spinner-animation infinite ${this.animationDuration}s ease;
          height: ${this.size};
          position: relative;
          width: ${this.size};
        }

        .fulfilling-bouncing-circle-spinner .orbit {
          animation: fulfilling-bouncing-circle-spinner-orbit-animation infinite ${this.animationDuration}s ease;
          border-radius: 50%;
          border: calc(${this.size} * 0.03) solid ${this.color};
          height: ${this.size};
          left: 0;
          position: absolute;
          top: 0;
          width: ${this.size};
        }

        .fulfilling-bouncing-circle-spinner .circle {
          animation: fulfilling-bouncing-circle-spinner-circle-animation infinite ${this.animationDuration}s ease;
          border-radius: 50%;
          border: calc(${this.size} * 0.1) solid ${this.color};
          color: ${this.color};
          display: block;
          height: ${this.size};
          position: relative;
          transform: rotate(0deg) scale(1);
          width: ${this.size};
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
