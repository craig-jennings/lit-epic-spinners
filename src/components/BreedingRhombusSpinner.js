import { html, LitElement } from '@polymer/lit-element';

class BreedingRhombusSpinner extends LitElement {
  static get is() { return 'breeding-rhombus-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = '2';
    this.color = '#ff1d5e';
    this.size = '65px';
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

        .breeding-rhombus-spinner {
          height: ${this.size};
          width: ${this.size};
          position: relative;
          transform: rotate(45deg);
        }

        .breeding-rhombus-spinner, .breeding-rhombus-spinner * {
          box-sizing: border-box;
        }

        .breeding-rhombus-spinner .rhombus {
          animation-duration: ${this.animationDuration}s;
          animation-iteration-count: infinite;
          background-color: ${this.color};
          height: calc(${this.size} / 7.5);
          left: calc(${this.size} / 2.3077);
          position: absolute;
          top: calc(${this.size} / 2.3077);
          width: calc(${this.size} / 7.5);
        }

        .breeding-rhombus-spinner .rhombus:nth-child(2n+0) {
          margin-right: 0;
        }

        .breeding-rhombus-spinner .rhombus.child-1 {
          animation-delay: calc(100ms * 1);
          animation-name: breeding-rhombus-spinner-animation-child-1;
        }

        .breeding-rhombus-spinner .rhombus.child-2 {
          animation-delay: calc(100ms * 2);
          animation-name: breeding-rhombus-spinner-animation-child-2;
        }

        .breeding-rhombus-spinner .rhombus.child-3 {
          animation-delay: calc(100ms * 3);
          animation-name: breeding-rhombus-spinner-animation-child-3;
        }

        .breeding-rhombus-spinner .rhombus.child-4 {
          animation-delay: calc(100ms * 4);
          animation-name: breeding-rhombus-spinner-animation-child-4;
        }

        .breeding-rhombus-spinner .rhombus.child-5 {
          animation-delay: calc(100ms * 5);
          animation-name: breeding-rhombus-spinner-animation-child-5;
        }

        .breeding-rhombus-spinner .rhombus.child-6 {
          animation-delay: calc(100ms * 6);
          animation-name: breeding-rhombus-spinner-animation-child-6;
        }

        .breeding-rhombus-spinner .rhombus.child-7 {
          animation-delay: calc(100ms * 7);
          animation-name: breeding-rhombus-spinner-animation-child-7;
        }

        .breeding-rhombus-spinner .rhombus.child-8 {
          animation-delay: calc(100ms * 8);
          animation-name: breeding-rhombus-spinner-animation-child-8;
        }

        .breeding-rhombus-spinner .rhombus.big {
          animation-delay: 0.5s;
          animation: breeding-rhombus-spinner-animation-child-big ${this.animationDuration}s infinite;
          background-color: ${this.color};
          height: calc(${this.size} / 3);
          left: calc(${this.size} / 3);
          top: calc(${this.size} / 3);
          width: calc(${this.size} / 3);
        }

        @keyframes breeding-rhombus-spinner-animation-child-1 {
          50% {
            transform: translate(-325%, -325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-2 {
          50% {
            transform: translate(0, -325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-3 {
          50% {
            transform: translate(325%, -325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-4 {
          50% {
            transform: translate(325%, 0);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-5 {
          50% {
            transform: translate(325%, 325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-6 {
          50% {
            transform: translate(0, 325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-7 {
          50% {
            transform: translate(-325%, 325%);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-8 {
          50% {
            transform: translate(-325%, 0);
          }
        }

        @keyframes breeding-rhombus-spinner-animation-child-big {
          50% {
            transform: scale(0.5);
          }
        }
      </style>

      <div class="breeding-rhombus-spinner">
        <div class="rhombus child-1"></div>
        <div class="rhombus child-2"></div>
        <div class="rhombus child-3"></div>
        <div class="rhombus child-4"></div>
        <div class="rhombus child-5"></div>
        <div class="rhombus child-6"></div>
        <div class="rhombus child-7"></div>
        <div class="rhombus child-8"></div>
        <div class="rhombus big"></div>
      </div>
    `;
  }
}

customElements.define(BreedingRhombusSpinner.is, BreedingRhombusSpinner);
