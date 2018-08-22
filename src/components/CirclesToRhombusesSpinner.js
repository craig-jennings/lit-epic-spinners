import { html, LitElement } from '@polymer/lit-element';

export class CirclesToRhombusesSpinner extends LitElement {
  static get is() { return 'circles-to-rhombuses-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      numCircles: Number,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = '1.2';
    this.color = '#ff1d5e';
    this.numCircles = 3;
    this.size = '15px';
  }

  _render() {
    const circleStyles = [];
    const circles = [];

    for (let i = 2; i <= this.numCircles; i++) {
      circleStyles.push(html`
        .circles-to-rhombuses-spinner .circle:nth-child(${i}) {
          animation-delay: calc(150ms * ${i});
        }
      `);

      circles.push(html`<div class="circle"></div>`);
    }

    return html`
      <style>
        :host {
          display: block;
        }

        * {
          box-sizing: border-box;
        }

        .circles-to-rhombuses-spinner, .circles-to-rhombuses-spinner * {
          box-sizing: border-box;
        }

        .circles-to-rhombuses-spinner {
          align-items: center;
          display: flex;
          height: ${this.size};
          justify-content: center
          width: calc( (${this.size} + ${this.size} * 1.125) * ${this.numCircles});
        }

        .circles-to-rhombuses-spinner .circle {
          animation: circles-to-rhombuses-animation ${this.animationDuration}s linear infinite;
          background: transparent;
          border-radius: 10%;
          border: 3px solid ${this.color};
          height: ${this.size};
          margin-left: calc(${this.size} * 1.125);
          overflow: hidden;
          transform: rotate(45deg);
          width: ${this.size};
        }

        .circles-to-rhombuses-spinner .circle:nth-child(1) {
          animation-delay: calc(150ms * 1);
          margin-left: 0;
        }

        ${circleStyles}

        @keyframes circles-to-rhombuses-animation {
          0% {
            border-radius: 10%;
          }
          17.5% {
            border-radius: 10%;
          }
          50% {
            border-radius: 100%;
          }
          93.5% {
            border-radius: 10%;
          }
          100% {
            border-radius: 10%;
          }
        }

        @keyframes circles-to-rhombuses-background-animation {
          50% {
            opacity: 0.4;
          }
        }
      </style>

      <div class="circles-to-rhombuses-spinner">
        <div class="circle"></div>
        ${circles}
      </div>
    `;
  }
}

customElements.define(CirclesToRhombusesSpinner.is, CirclesToRhombusesSpinner);
