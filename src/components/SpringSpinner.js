import { html, LitElement } from '@polymer/lit-element';

export class SpringSpinner extends LitElement {
  static get is() { return 'spring-spinner'; }

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
    this.duration = 3;
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

       .spring-spinner {
          height: var(--spring-spinner-size, ${this.size}px);
          width: var(--spring-spinner-size, ${this.size}px);
        }

        .spring-spinner .spring-spinner-part {
          height: calc(var(--spring-spinner-size, ${this.size}px) / 2);
          overflow: hidden;
          width: var(--spring-spinner-size, ${this.size}px);
        }

        .spring-spinner  .spring-spinner-part.bottom {
           transform: rotate(180deg) scale(-1, 1);
        }

        .spring-spinner .spring-spinner-rotator {
          animation: spring-spinner-animation var(--spring-spinner-duration, ${this.duration}s) ease-in-out infinite;
          border-bottom-color: transparent;
          border-left-color: transparent;
          border-radius: 50%;
          border-right-color: var(--spring-spinner-color, ${this.color});
          border-style: solid;
          border-top-color: var(--spring-spinner-color, ${this.color});
          border-width: calc(var(--spring-spinner-size, ${this.size}px) / 7);
          height: var(--spring-spinner-size, ${this.size}px);
          transform: rotate(-200deg);
          width: var(--spring-spinner-size, ${this.size}px);
        }

        @keyframes spring-spinner-animation {
          0% {
            border-width: calc(var(--spring-spinner-size, ${this.size}px) / 7);
          }

          25% {
            border-width: calc(var(--spring-spinner-size, ${this.size}px) / 23.33);
          }

          50% {
            transform: rotate(115deg);
            border-width: calc(var(--spring-spinner-size, ${this.size}px) / 7);
          }

          75% {
            border-width: calc(var(--spring-spinner-size, ${this.size}px) / 23.33);
          }

          100% {
            border-width: calc(var(--spring-spinner-size, ${this.size}px) / 7);
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
