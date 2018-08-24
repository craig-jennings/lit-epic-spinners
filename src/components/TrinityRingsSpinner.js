import { html, LitElement } from '@polymer/lit-element';

export class TrinityRingsSpinner extends LitElement {
  static get is() { return 'trinity-rings-spinner'; }

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
    this.duration = 1.5;
    this.size = 60;
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

       .trinity-rings-spinner {
          align-items: center;
          display: flex;
          flex-direction: row;
          height: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 2);
          justify-content: center;
          overflow: hidden;
          padding: 3px;
          position: relative;
          width: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 2);
        }

        .trinity-rings-spinner .circle {
          border-radius: 50%;
          border: 3px solid var(--trinity-rings-spinner-color, ${this.color});
          display: block;
          opacity: 1;
          position: absolute;
        }

        .trinity-rings-spinner .circle:nth-child(1) {
          animation: trinity-rings-spinner-circle1-animation var(--trinity-rings-spinner-duration, ${this.duration}s) infinite linear;
          border-width: 3px;
          height: var(--trinity-rings-spinner-size, ${this.size}px);
          width: var(--trinity-rings-spinner-size, ${this.size}px);
        }

        .trinity-rings-spinner .circle:nth-child(2) {
          animation: trinity-rings-spinner-circle2-animation var(--trinity-rings-spinner-duration, ${this.duration}s) infinite linear;
          border-width: 2px;
          height: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 0.65);
          width: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 0.65);
        }

        .trinity-rings-spinner .circle:nth-child(3) {
          animation:trinity-rings-spinner-circle3-animation var(--trinity-rings-spinner-duration, ${this.duration}s) infinite linear;
          border-width: 1px;
          height: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 0.1);
          width: calc(var(--trinity-rings-spinner-size, ${this.size}px) * 0.1);
        }

        @keyframes trinity-rings-spinner-circle1-animation{
          0%   { transform: rotateZ(20deg)  rotateY(0deg); }
          100% { transform: rotateZ(100deg) rotateY(360deg); }
        }

        @keyframes trinity-rings-spinner-circle2-animation{
          0%   { transform: rotateZ(100deg) rotateX(0deg); }
          100% { transform: rotateZ(0deg)   rotateX(360deg); }
        }

        @keyframes trinity-rings-spinner-circle3-animation{
          0%   { transform: rotateZ(100deg)  rotateX(-360deg); }
          100% { transform: rotateZ(-360deg) rotateX(360deg); }
        }
      </style>

      <div class="trinity-rings-spinner">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
      </div>
    `;
  }
}

customElements.define(TrinityRingsSpinner.is, TrinityRingsSpinner);
