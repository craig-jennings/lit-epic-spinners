import { html, LitElement } from '@polymer/lit-element';

export class SemipolarSpinner extends LitElement {
  static get is() { return 'semipolar-spinner'; }

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
    this.size = 65;
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

       .semipolar-spinner {
          height: var(--semipolar-spinner-size, ${this.size}px);
          position: relative;
          width: var(--semipolar-spinner-size, ${this.size}px);
        }

        .semipolar-spinner .ring {
          animation: semipolar-spinner-animation var(--semipolar-spinner-duration, ${this.duration}s) infinite;
          border-bottom-color: transparent;
          border-left-color: var(--semipolar-spinner-color, ${this.color});
          border-radius: 50%;
          border-right-color: transparent;
          border-style: solid;
          border-top-color: var(--semipolar-spinner-color, ${this.color});
          border-width: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.05);
          position: absolute;
        }

        .semipolar-spinner .ring:nth-child(1) {
          animation-delay: calc(var(--semipolar-spinner-duration, ${this.duration}s) * 0.1 * 4);
          height: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 0);
          left: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 0);
          top: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 0);
          width: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 0);
          z-index: 5;
        }

        .semipolar-spinner .ring:nth-child(2) {
          animation-delay: calc(var(--semipolar-spinner-duration, ${this.duration}s) * 0.1 * 3);
          height: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 1);
          left: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 1);
          top: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 1);
          width: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 1);
          z-index: 4;
        }

        .semipolar-spinner .ring:nth-child(3) {
          animation-delay: calc(var(--semipolar-spinner-duration, ${this.duration}s) * 0.1 * 2);
          height: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 2);
          left: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 2);
          top: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 2);
          width: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 2);
          z-index: 3;
        }

        .semipolar-spinner .ring:nth-child(4) {
          animation-delay: calc(var(--semipolar-spinner-duration, ${this.duration}s) * 0.1 * 1);
          height: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 3);
          left: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 3);
          top: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 3);
          width: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 3);
          z-index: 2;
        }

        .semipolar-spinner .ring:nth-child(5) {
          animation-delay: calc(var(--semipolar-spinner-duration, ${this.duration}s) * 0.1 * 0);
          height: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 4);
          left: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 4);
          top: calc(var(--semipolar-spinner-size, ${this.size}px) * 0.1 * 4);
          width: calc(var(--semipolar-spinner-size, ${this.size}px) - var(--semipolar-spinner-size, ${this.size}px) * 0.2 * 4);
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
