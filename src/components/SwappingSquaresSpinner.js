import { html, LitElement } from '@polymer/lit-element';

class SwappingSquaresSpinner extends LitElement {
  static get is() { return 'swapping-squares-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = 1;
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

       .swapping-squares-spinner {
          align-items: center;
          display: flex;
          flex-direction: row;
          height: ${this.size};
          justify-content: center;
          position: relative;
          width: ${this.size};
        }

        .swapping-squares-spinner .square {
          animation-duration: ${this.animationDuration}s;
          animation-iteration-count: infinite;
          border: calc(${this.size} * 0.04 / 1.3) solid ${this.color};
          height: calc(${this.size} * 0.25 / 1.3);
          margin-left: auto;
          margin-right: auto;
          position: absolute;
          width: calc(${this.size} * 0.25 / 1.3);
        }

        .swapping-squares-spinner .square:nth-child(1) {
          animation-delay: calc(${this.animationDuration}s / 2);
          animation-name: swapping-squares-animation-child-1;
        }

        .swapping-squares-spinner .square:nth-child(2) {
          animation-delay: 0ms;
          animation-name: swapping-squares-animation-child-2;
        }

        .swapping-squares-spinner .square:nth-child(3) {
          animation-delay: calc(${this.animationDuration}s / 2);
          animation-name: swapping-squares-animation-child-3;
        }

        .swapping-squares-spinner .square:nth-child(4) {
          animation-delay: 0ms;
          animation-name: swapping-squares-animation-child-4;
        }

        @keyframes swapping-squares-animation-child-1 {
          50% { transform: translate(150%,150%) scale(2,2); }
        }

        @keyframes swapping-squares-animation-child-2 {
          50% { transform: translate(-150%,150%) scale(2,2); }
        }

        @keyframes swapping-squares-animation-child-3 {
          50% { transform: translate(-150%,-150%) scale(2,2); }
        }

        @keyframes swapping-squares-animation-child-4 {
          50% { transform: translate(150%,-150%) scale(2,2); }
        }
      </style>

      <div class="swapping-squares-spinner" :style="spinnerStyle">
        <div class="square"></div>
        <div class="square"></div>
        <div class="square"></div>
        <div class="square"></div>
      </div>
    `;
  }
}

customElements.define(SwappingSquaresSpinner.is, SwappingSquaresSpinner);
