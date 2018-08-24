import { html, LitElement } from '@polymer/lit-element';

export class PixelSpinner extends LitElement {
  static get is() { return 'pixel-spinner'; }

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
    this.duration = 2;
    this.size = 70;
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

       .pixel-spinner {
          align-items: center;
          display: flex;
          flex-direction: row;
          height: var(--pixel-spinner-size, ${this.size}px);
          justify-content: center;
          width: var(--pixel-spinner-size, ${this.size}px);
        }

        .pixel-spinner .pixel-spinner-inner {
          animation: pixel-spinner-animation var(--pixel-spinner-duration, ${this.duration}s) linear infinite;
          background-color: var(--pixel-spinner-color, ${this.color});
          box-shadow: 15px 15px  0 0,
                      -15px -15px  0 0,
                      15px -15px  0 0,
                      -15px 15px  0 0,
                      0 15px  0 0,
                      15px 0  0 0,
                      -15px 0  0 0,
                      0 -15px 0 0;
          color: var(--pixel-spinner-color, ${this.color});
          height: calc(var(--pixel-spinner-size, ${this.size}px) / 7);
          width: calc(var(--pixel-spinner-size, ${this.size}px) / 7);
        }

        @keyframes pixel-spinner-animation {
          50% {
            box-shadow: 20px 20px 0px 0px,
                        -20px -20px 0px 0px,
                        20px -20px 0px 0px,
                        -20px 20px 0px 0px,
                        0px 10px 0px 0px,
                        10px 0px 0px 0px,
                        -10px 0px 0px 0px,
                        0px -10px 0px 0px;
          }

          75% {
            box-shadow: 20px 20px 0px 0px,
                        -20px -20px 0px 0px,
                        20px -20px 0px 0px,
                        -20px 20px 0px 0px,
                        0px 10px 0px 0px,
                        10px 0px 0px 0px,
                        -10px 0px 0px 0px,
                        0px -10px 0px 0px;
          }

          100% {
            transform: rotate(360deg);
          }
        }
      </style>

      <div class="pixel-spinner">
        <div class="pixel-spinner-inner"></div>
      </div>
    `;
  }
}

customElements.define(PixelSpinner.is, PixelSpinner);
