import { html, LitElement } from '@polymer/lit-element';

class SemipolarSpinner extends LitElement {
  static get is() { return 'semipolar-spinner'; }

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
    this.size = '65px';
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

       .semipolar-spinner {
          height: ${this.size};
          position: relative;
          width: ${this.size};
        }

        .semipolar-spinner .ring {
          animation: semipolar-spinner-animation ${this.animationDuration}s infinite;
          border-bottom-color: transparent;
          border-left-color: ${this.color};
          border-radius: 50%;
          border-right-color: transparent;
          border-style: solid;
          border-top-color: ${this.color};
          border-width: calc(${this.size} * 0.05);
          position: absolute;
        }

        .semipolar-spinner .ring:nth-child(1) {
          animation-delay: calc(${this.animationDuration}s * 0.1 * 4);
          height: calc(${this.size} - ${this.size} * 0.2 * 0);
          left: calc(${this.size} * 0.1 * 0);
          top: calc(${this.size} * 0.1 * 0);
          width: calc(${this.size} - ${this.size} * 0.2 * 0);
          z-index: 5;
        }

        .semipolar-spinner .ring:nth-child(2) {
          animation-delay: calc(${this.animationDuration}s * 0.1 * 3);
          height: calc(${this.size} - ${this.size} * 0.2 * 1);
          left: calc(${this.size} * 0.1 * 1);
          top: calc(${this.size} * 0.1 * 1);
          width: calc(${this.size} - ${this.size} * 0.2 * 1);
          z-index: 4;
        }

        .semipolar-spinner .ring:nth-child(3) {
          animation-delay: calc(${this.animationDuration}s * 0.1 * 2);
          height: calc(${this.size} - ${this.size} * 0.2 * 2);
          left: calc(${this.size} * 0.1 * 2);
          top: calc(${this.size} * 0.1 * 2);
          width: calc(${this.size} - ${this.size} * 0.2 * 2);
          z-index: 3;
        }

        .semipolar-spinner .ring:nth-child(4) {
          animation-delay: calc(${this.animationDuration}s * 0.1 * 1);
          height: calc(${this.size} - ${this.size} * 0.2 * 3);
          left: calc(${this.size} * 0.1 * 3);
          top: calc(${this.size} * 0.1 * 3);
          width: calc(${this.size} - ${this.size} * 0.2 * 3);
          z-index: 2;
        }

        .semipolar-spinner .ring:nth-child(5) {
          animation-delay: calc(${this.animationDuration}s * 0.1 * 0);
          height: calc(${this.size} - ${this.size} * 0.2 * 4);
          left: calc(${this.size} * 0.1 * 4);
          top: calc(${this.size} * 0.1 * 4);
          width: calc(${this.size} - ${this.size} * 0.2 * 4);
          z-index: 1;
        }

        @keyframes semipolar-spinner-animation {
          50% { transform: rotate(360deg) scale(0.7); }
        }
      </style>

      <div class="semipolar-spinner" :style="spinnerStyle">
        <div class="ring"></div>
        <div class="ring"></div>
        <div class="ring"></div>
        <div class="ring"></div>
        <div class="ring"></div>
      </div>
    `;
  }
}

customElements.define(SemipolarSpinner.is, SemipolarSpinner);
