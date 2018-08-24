import { html, LitElement } from '@polymer/lit-element';

export class IntersectingCirclesSpinner extends LitElement {
  static get is() { return 'intersecting-circles-spinner'; }

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
    this.duration = 1.2;
    this.size = 35;
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

       .intersecting-circles-spinner {
          height: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 2);
          width: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 2);
          position: relative;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }

        .intersecting-circles-spinner .spinnerBlock {
          animation: intersecting-circles-spinners-animation var(--intersecting-circles-spinner-duration, ${this.duration}s) linear infinite;
          transform-origin: center;
          display: block;
          height: var(--intersecting-circles-spinner-size, ${this.size}px);
          width: var(--intersecting-circles-spinner-size, ${this.size}px);
        }

        .intersecting-circles-spinner .circle {
          display: block;
          border: 2px solid var(--intersecting-circles-spinner-color, ${this.color});
          border-radius: 50%;
          height: 100%;
          width: 100%;
          position: absolute;
          left: 0;
          top: 0;
        }

        .intersecting-circles-spinner .circle:nth-child(1) {
          left: 0;
          top: 0;
        }

        .intersecting-circles-spinner .circle:nth-child(2) {
          left: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * -0.36);
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 0.2);
        }

        .intersecting-circles-spinner .circle:nth-child(3) {
          left: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * -0.36);
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * -0.2);
        }

        .intersecting-circles-spinner .circle:nth-child(4) {
          left: 0;
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * -0.36);
        }

        .intersecting-circles-spinner .circle:nth-child(5) {
          left: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 0.36);
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * -0.2);
        }

        .intersecting-circles-spinner .circle:nth-child(6) {
          left: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 0.36);
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 0.2);
        }

        .intersecting-circles-spinner .circle:nth-child(7) {
          left: 0;
          top: calc(var(--intersecting-circles-spinner-size, ${this.size}px) * 0.36);
        }

        @keyframes intersecting-circles-spinners-animation {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      </style>

      <div class="intersecting-circles-spinner">
        <div class="spinnerBlock">
          <span class="circle"></span>
          <span class="circle"></span>
          <span class="circle"></span>
          <span class="circle"></span>
          <span class="circle"></span>
          <span class="circle"></span>
          <span class="circle"></span>
        </div>
      </div>
    `;
  }
}

customElements.define(IntersectingCirclesSpinner.is, IntersectingCirclesSpinner);
