import { html, LitElement } from '@polymer/lit-element';

export class SwappingSquaresSpinner extends LitElement {
  static get is() { return 'swapping-squares-spinner'; }

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

       .swapping-squares-spinner {
          align-items: center;
          display: flex;
          flex-direction: row;
          height: var(--swapping-squares-spinner-size, ${this.size}px);
          justify-content: center;
          position: relative;
          width: var(--swapping-squares-spinner-size, ${this.size}px);
        }

        .swapping-squares-spinner .square {
          animation-duration: var(--swapping-squares-spinner-duration, ${this.duration}s);
          animation-iteration-count: infinite;
          border: calc(var(--swapping-squares-spinner-size, ${this.size}px) * 0.04 / 1.3) solid var(--swapping-squares-spinner-color, ${this.color});
          height: calc(var(--swapping-squares-spinner-size, ${this.size}px) * 0.25 / 1.3);
          margin-left: auto;
          margin-right: auto;
          position: absolute;
          width: calc(var(--swapping-squares-spinner-size, ${this.size}px) * 0.25 / 1.3);
        }

        .swapping-squares-spinner .square:nth-child(1) {
          animation-delay: calc(var(--swapping-squares-spinner-duration, ${this.duration}s) / 2);
          animation-name: swapping-squares-animation-child-1;
        }

        .swapping-squares-spinner .square:nth-child(2) {
          animation-delay: 0ms;
          animation-name: swapping-squares-animation-child-2;
        }

        .swapping-squares-spinner .square:nth-child(3) {
          animation-delay: calc(var(--swapping-squares-spinner-duration, ${this.duration}s) / 2);
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
