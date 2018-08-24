import { html, LitElement } from '@polymer/lit-element';

export class FulfillingSquareSpinner extends LitElement {
  static get is() { return 'fulfilling-square-spinner'; }

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

        .fulfilling-square-spinner {
          height: var(--fulfilling-square-spinner-size, ${this.size}px);
          width: var(--fulfilling-square-spinner-size, ${this.size}px);
          position: relative;
          border: 4px solid var(--fulfilling-square-spinner-color, ${this.color});
          animation: fulfilling-square-spinner-animation var(--fulfilling-square-spinner-duration, ${this.duration}s) infinite ease;
        }

        .fulfilling-square-spinner .spinner-inner {
          vertical-align: top;
          display: inline-block;
          background-color: var(--fulfilling-square-spinner-color, ${this.color});
          width: 100%;
          opacity: 1;
          animation: fulfilling-square-spinner-inner-animation var(--fulfilling-square-spinner-duration, ${this.duration}s) infinite ease-in;
        }

        @keyframes fulfilling-square-spinner-animation {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(180deg); }
          50%  { transform: rotate(180deg); }
          75%  { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fulfilling-square-spinner-inner-animation {
          0%   { height: 0%; }
          25%  { height: 0%; }
          50%  { height: 100%; }
          75%  { height: 100%; }
          100% { height: 0%; }
        }
      </style>

      <div class="fulfilling-square-spinner">
        <div class="spinner-inner"></div>
      </div>
    `;
  }
}

customElements.define(FulfillingSquareSpinner.is, FulfillingSquareSpinner);
