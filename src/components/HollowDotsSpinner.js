import { html, LitElement } from '@polymer/lit-element';

export class HollowDotsSpinner extends LitElement {
  static get is() { return 'hollow-dots-spinner'; }

  static get properties() {
    return {
      duration: Number,
      color: String,
      numDots: Number,
      size: Number,
    };
  }

  constructor() {
    super();

    this.color = '#ff1d5e';
    this.duration = 1;
    this.numDots = 3;
    this.size = 15;
  }

  _render() {
    const dotStyles = [];
    const dots = [];

    for (let i = 1; i <= this.numDots; i++) {
      dotStyles.push(html`
        .hollow-dots-spinner .dot:nth-child(${i}) {
          animation-delay: calc(var(--hollow-dots-spinner-duration, ${this.duration}s) / ${this.numDots} * ${i});
        }
      `);

      dots.push(html`<div class="dot"></div>`);
    }

    return html`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

       .hollow-dots-spinner {
          height: var(--hollow-dots-spinner-size, ${this.size}px);
          width: calc(var(--hollow-dots-spinner-size, ${this.size}px) * 2 * ${this.numDots});
        }

        .hollow-dots-spinner .dot {
          animation: hollow-dots-spinner-animation var(--hollow-dots-spinner-duration, ${this.duration}s) ease infinite 0ms;
          border-radius: 50%;
          border: calc(var(--hollow-dots-spinner-size, ${this.size}px) / 5) solid var(--hollow-dots-spinner-color, ${this.color});
          float: left;
          height: var(--hollow-dots-spinner-size, ${this.size}px);
          margin: 0 calc(var(--hollow-dots-spinner-size, ${this.size}px) / 2);
          transform: scale(0);
          width: var(--hollow-dots-spinner-size, ${this.size}px);
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
