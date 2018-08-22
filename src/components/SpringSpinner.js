import { html, LitElement } from '@polymer/lit-element';

export class SpringSpinner extends LitElement {
  static get is() { return 'spring-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = 3;
    this.color = '#ff1d5e';
    this.size = '60px';
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

       .spring-spinner {
          height: ${this.size};
          width: ${this.size};
        }

        .spring-spinner .spring-spinner-part {
          height: calc(${this.size} / 2);
          overflow: hidden;
          width: ${this.size};
        }

        .spring-spinner  .spring-spinner-part.bottom {
           transform: rotate(180deg) scale(-1, 1);
        }

        .spring-spinner .spring-spinner-rotator {
          animation: spring-spinner-animation ${this.animationDuration}s ease-in-out infinite;
          border-bottom-color: transparent;
          border-left-color: transparent;
          border-radius: 50%;
          border-right-color: ${this.color};
          border-style: solid;
          border-top-color: ${this.color};
          border-width: calc(${this.size} / 7);
          height: ${this.size};
          transform: rotate(-200deg);
          width: ${this.size};
        }

        @keyframes spring-spinner-animation {
          0% {
            border-width: calc(${this.size} / 7);
          }

          25% {
            border-width: calc(${this.size} / 23.33);
          }

          50% {
            transform: rotate(115deg);
            border-width: calc(${this.size} / 7);
          }

          75% {
            border-width: calc(${this.size} / 23.33);
          }

          100% {
            border-width: calc(${this.size} / 7);
          }
        }
      </style>

      <div class="spring-spinner">
        <div class="spring-spinner-part top">
          <div class="spring-spinner-rotator"></div>
        </div>

        <div class="spring-spinner-part bottom">
          <div class="spring-spinner-rotator"></div>
        </div>
      </div>
    `;
  }
}

customElements.define(SpringSpinner.is, SpringSpinner);
