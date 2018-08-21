import { html, LitElement } from '@polymer/lit-element';

class PixelSpinner extends LitElement {
  static get is() { return 'pixel-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = 2;
    this.color = '#ff1d5e';
    this.size = '70px';
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

       .pixel-spinner {
          align-items: center;
          display: flex;
          flex-direction: row;
          height: ${this.size};
          justify-content: center;
          width: ${this.size};
        }

        .pixel-spinner .pixel-spinner-inner {
          animation: pixel-spinner-animation ${this.animationDuration}s linear infinite;
          background-color: ${this.color};
          box-shadow: 15px 15px  0 0,
                      -15px -15px  0 0,
                      15px -15px  0 0,
                      -15px 15px  0 0,
                      0 15px  0 0,
                      15px 0  0 0,
                      -15px 0  0 0,
                      0 -15px 0 0;
          color: ${this.color};
          height: calc(${this.size} / 7);
          width: calc(${this.size} / 7);
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
