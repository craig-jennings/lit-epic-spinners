import { html, LitElement } from '@polymer/lit-element';

export class SelfBuildingSquareSpinner extends LitElement {
  static get is() { return 'self-building-square-spinner'; }

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
    this.duration = 6;
    this.size = 10;
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

       .self-building-square-spinner {
          height: calc(var(--self-building-square-spinner-size, ${this.size}px) * 4);
          top: calc(var(--self-building-square-spinner-size, ${this.size}px) * 2 / 3);
          width: calc(var(--self-building-square-spinner-size, ${this.size}px) * 4);
        }
        .self-building-square-spinner .square {
          animation: self-building-square-spinner var(--self-building-square-spinner-duration, ${this.duration}s) infinite;
          background: var(--self-building-square-spinner-color, ${this.color});
          float: left;
          height: var(--self-building-square-spinner-size, ${this.size}px);
          margin-right: calc(var(--self-building-square-spinner-size, ${this.size}px) / 3);
          margin-top: calc(var(--self-building-square-spinner-size, ${this.size}px) / 3);
          opacity: 0;
          position:relative;
          top: calc(var(--self-building-square-spinner-size, ${this.size}px) * -2 / 3);
          width: var(--self-building-square-spinner-size, ${this.size}px);
        }

        .self-building-square-spinner .square:nth-child(1) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 6);
        }

        .self-building-square-spinner .square:nth-child(2) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 7);
        }

        .self-building-square-spinner .square:nth-child(3) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 8);
        }

        .self-building-square-spinner .square:nth-child(4) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 3);
        }

        .self-building-square-spinner .square:nth-child(5) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 4);
        }

        .self-building-square-spinner .square:nth-child(6) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 5);
        }

        .self-building-square-spinner .square:nth-child(7) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 0);
        }

        .self-building-square-spinner .square:nth-child(8) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 1);
        }

        .self-building-square-spinner .square:nth-child(9) {
          animation-delay: calc(var(--self-building-square-spinner-duration, ${this.duration}s) / 20 * 2);
        }

        .self-building-square-spinner .clear {
          clear: both;
        }

        @keyframes self-building-square-spinner {
          0% {
            opacity: 0;
          }

          5% {
            opacity: 1;
            top: 0;
          }

          50.9% {
            opacity: 1;
            top: 0;
          }

          55.9% {
            opacity: 0;
            top: inherit;
          }
        }
      </style>

      <div class="self-building-square-spinner">
        <div class="square"></div>
        <div class="square"></div>
        <div class="square"></div>
        <div class="square clear"></div>
        <div class="square"></div>
        <div class="square"></div>
        <div class="square clear"></div>
        <div class="square"></div>
        <div class="square"></div>
      </div>
    `;
  }
}

customElements.define(SelfBuildingSquareSpinner.is, SelfBuildingSquareSpinner);
