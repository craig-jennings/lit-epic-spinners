import { html, LitElement } from '@polymer/lit-element';

export class CirclesToRhombusesSpinner extends LitElement {
  static get is() { return 'circles-to-rhombuses-spinner'; }

  static get properties() {
    return {
      color: String,
      duration: Number,
      numCircles: Number,
      size: Number,
    };
  }

  constructor() {
    super();

    this.color = '#ff1d5e';
    this.duration = 1.2;
    this.numCircles = 3;
    this.size = 15;
  }

  _render() {
    const circleStyles = [];
    const circles = [];

    for (let i = 2; i <= this.numCircles; i++) {
      circleStyles.push(html`
        .circles-to-rhombuses-spinner .circle:nth-child(${i}) {
          animation-delay: calc(var(--circles-to-rhombuses-spinner-duration, ${this.duration}s) / 8 * ${i});
        }
      `);

      circles.push(html`<div class="circle"></div>`);
    }

    return html`
      <style>
        * {
          box-sizing: border-box;
        }

        :host {
          display: block;
        }

        .circles-to-rhombuses-spinner, .circles-to-rhombuses-spinner * {
          box-sizing: border-box;
        }

        .circles-to-rhombuses-spinner {
          align-items: center;
          display: flex;
          height: var(--circles-to-rhombuses-spinner-size, ${this.size}px);
          justify-content: center
          width: calc((var(--circles-to-rhombuses-spinner-size, ${this.size}px) + var(--circles-to-rhombuses-spinner-size, ${this.size}px) * 1.125) * ${this.numCircles});
        }

        .circles-to-rhombuses-spinner .circle {
          animation: circles-to-rhombuses-animation var(--circles-to-rhombuses-spinner-duration, ${this.duration}s) linear infinite;
          background: transparent;
          border-radius: 10%;
          border: 3px solid var(--circles-to-rhombuses-spinner-color, ${this.color});
          height: var(--circles-to-rhombuses-spinner-size, ${this.size}px);
          margin-left: calc(var(--circles-to-rhombuses-spinner-size, ${this.size}px) * 1.125);
          overflow: hidden;
          transform: rotate(45deg);
          width: var(--circles-to-rhombuses-spinner-size, ${this.size}px);
        }

        .circles-to-rhombuses-spinner .circle:nth-child(1) {
          animation-delay: calc(var(--circles-to-rhombuses-spinner-duration, ${this.duration}s) / 8 * 1);
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
