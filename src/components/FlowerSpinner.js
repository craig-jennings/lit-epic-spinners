import { html, LitElement } from '@polymer/lit-element';

export class FlowerSpinner extends LitElement {
  static get is() { return 'flower-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = 2.5;
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

        .flower-spinner {
          align-items: center;
          display: flex;
          flex-direction: row;
          height: ${this.size};
          justify-content: center;
          width: ${this.size};
        }

        .flower-spinner .dots-container {
          height: calc(${this.size} / 7);
          width: calc(${this.size} / 7);
        }

        .flower-spinner .smaller-dot {
          animation: flower-spinner-smaller-dot-animation ${this.animationDuration}s 0s infinite both;
          background: ${this.color};
          border-radius: 50%;
          height: 100%;
          width: 100%;
        }

        .flower-spinner .bigger-dot {
          animation: flower-spinner-bigger-dot-animation ${this.animationDuration}s 0s infinite both;
          background: ${this.color};
          border-radius: 50%;
          height: 100%;
          padding: 10%;
          width: 100%;
        }

        @keyframes flower-spinner-bigger-dot-animation {
          0%, 100% {
            box-shadow: ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px;
          }
          50% {
            transform: rotate(180deg);
          }
          25%, 75% {
            box-shadow: ${this.color} 26px 0px 0px,
                        ${this.color} -26px 0px 0px,
                        ${this.color} 0px 26px 0px,
                        ${this.color} 0px -26px 0px,
                        ${this.color} 19px -19px 0px,
                        ${this.color} 19px 19px 0px,
                        ${this.color} -19px -19px 0px,
                        ${this.color} -19px 19px 0px;
          }
          100% {
            transform: rotate(360deg);
            box-shadow: ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px;
          }
        }
        @keyframes flower-spinner-smaller-dot-animation {
          0%, 100% {
            box-shadow: ${this.color} 0px 0px 0px,
            ${this.color} 0px 0px 0px,
            ${this.color} 0px 0px 0px,
            ${this.color} 0px 0px 0px,
            ${this.color} 0px 0px 0px,
            ${this.color} 0px 0px 0px,
            ${this.color} 0px 0px 0px,
            ${this.color} 0px 0px 0px;
          }
          25%, 75% {
            box-shadow: ${this.color} 14px 0px 0px,
                        ${this.color} -14px 0px 0px,
                        ${this.color} 0px 14px 0px,
                        ${this.color} 0px -14px 0px,
                        ${this.color} 10px -10px 0px,
                        ${this.color} 10px 10px 0px,
                        ${this.color} -10px -10px 0px,
                        ${this.color} -10px 10px 0px;
          }
          100% {
            box-shadow: ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px,
                        ${this.color} 0px 0px 0px;
          }
        }
      </style>

      <div class="flower-spinner">
        <div class="dots-container">
          <div class="bigger-dot">
            <div class="smaller-dot"></div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define(FlowerSpinner.is, FlowerSpinner);
