import { html, LitElement } from '@polymer/lit-element';

export class HollowDotsSpinner extends LitElement {
  static get is() { return 'hollow-dots-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      numDots: Number,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = 1;
    this.color = '#ff1d5e';
    this.numDots = 3;
    this.size = '15px';
  }

  _render() {
    const dotStyles = [];
    const dots = [];

    for (let i = 1; i <= this.numDots; i++) {
      dotStyles.push(html`
        .hollow-dots-spinner .dot:nth-child(${i}) {
          animation-delay: calc(300ms * ${i});
        }
      `);

      dots.push(html`<div class="dot"></div>`);
    }

    return html`
      <style>
        :host {
          display: block;
        }

        * {
          box-sizing: border-box;
        }

       .hollow-dots-spinner {
          height: ${this.size};
          width: calc(${this.size} * 2 * ${this.numDots});
        }

        .hollow-dots-spinner .dot {
          animation: hollow-dots-spinner-animation ${this.animationDuration}s ease infinite 0ms;
          border-radius: 50%;
          border: calc(${this.size} / 5) solid ${this.color};
          float: left;
          height: ${this.size};
          margin: 0 calc(${this.size} / 2);
          transform: scale(0);
          width: ${this.size};
        }

        ${dotStyles}

        @keyframes hollow-dots-spinner-animation {
          50% {
            transform: scale(1);
            opacity: 1;
          }

          100% {
            opacity: 0;
          }
        }
      </style>

      <div class="hollow-dots-spinner">
        ${dots}
      </div>
    `;
  }
}

customElements.define(HollowDotsSpinner.is, HollowDotsSpinner);
