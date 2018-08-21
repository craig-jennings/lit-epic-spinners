import { html, LitElement } from '@polymer/lit-element';

class SelfBuildingSquareSpinner extends LitElement {
  static get is() { return 'self-building-square-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = 6;
    this.color = '#ff1d5e';
    this.size = '10px';
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

       .self-building-square-spinner {
          height: ${this.size} * 4;
          top: calc(${this.size} * 2 / 3);
          width: ${this.size} * 4;
        }
        .self-building-square-spinner .square {
          animation: self-building-square-spinner ${this.animationDuration}s infinite;
          background: ${this.color};
          float: left;
          height: ${this.size};
          margin-right: calc(${this.size} / 3);
          margin-top: calc(${this.size} / 3);
          opacity: 0;
          position:relative;
          top: calc(-${this.size} * 2 / 3);
          width: ${this.size};
        }

        .self-building-square-spinner .square:nth-child(1) {
          animation-delay: calc(${this.animationDuration}s / 20 * 6);
        }

        .self-building-square-spinner .square:nth-child(2) {
          animation-delay: calc(${this.animationDuration}s / 20 * 7);
        }

        .self-building-square-spinner .square:nth-child(3) {
          animation-delay: calc(${this.animationDuration}s / 20 * 8);
        }

        .self-building-square-spinner .square:nth-child(4) {
          animation-delay: calc(${this.animationDuration}s / 20 * 3);
        }

        .self-building-square-spinner .square:nth-child(5) {
          animation-delay: calc(${this.animationDuration}s / 20 * 4);
        }

        .self-building-square-spinner .square:nth-child(6) {
          animation-delay: calc(${this.animationDuration}s / 20 * 5);
        }

        .self-building-square-spinner .square:nth-child(7) {
          animation-delay: calc(${this.animationDuration}s / 20 * 0);
        }

        .self-building-square-spinner .square:nth-child(8) {
          animation-delay: calc(${this.animationDuration}s / 20 * 1);
        }

        .self-building-square-spinner .square:nth-child(9) {
          animation-delay: calc(${this.animationDuration}s / 20 * 2);
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
