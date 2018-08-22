import { html, LitElement } from '@polymer/lit-element';

export class FulfillingSquareSpinner extends LitElement {
  static get is() { return 'fulfilling-square-spinner'; }

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

        .fulfilling-square-spinner {
          height: ${this.size};
          width: ${this.size};
          position: relative;
          border: 4px solid ${this.color};
          animation: fulfilling-square-spinner-animation ${this.animationDuration}s infinite ease;
        }

        .fulfilling-square-spinner .spinner-inner {
          vertical-align: top;
          display: inline-block;
          background-color: ${this.color};
          width: 100%;
          opacity: 1;
          animation: fulfilling-square-spinner-inner-animation ${this.animationDuration}s infinite ease-in;
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
