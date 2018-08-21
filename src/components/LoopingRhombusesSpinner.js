import { html, LitElement } from '@polymer/lit-element';

class LoopingRhombusesSpinner extends LitElement {
  static get is() { return 'looping-rhombuses-spinner'; }

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
    this.size = '15px';
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

       .looping-rhombuses-spinner {
          height: ${this.size};
          position: relative;
          width: calc(${this.size} * 4);
        }

        .looping-rhombuses-spinner .rhombus {
          animation: looping-rhombuses-spinner-animation ${this.animationDuration}s linear infinite;
          background-color: ${this.color};
          border-radius: 2px;
          height: ${this.size};
          left: calc(${this.size} * 4);
          margin: 0 auto;
          position: absolute;
          transform: translateY(0) rotate(45deg) scale(0);
          width: ${this.size};
        }

        .looping-rhombuses-spinner .rhombus:nth-child(1) {
          animation-delay: calc(${this.animationDuration}s * 1 / -1.5);
        }

        .looping-rhombuses-spinner .rhombus:nth-child(2) {
          animation-delay: calc(${this.animationDuration}s * 2 / -1.5);
        }

        .looping-rhombuses-spinner .rhombus:nth-child(3) {
          animation-delay: calc(${this.animationDuration}s * 3 / -1.5);
        }

        @keyframes looping-rhombuses-spinner-animation {
          0%   { transform: translateX(0)     rotate(45deg) scale(0); }
          50%  { transform: translateX(-233%) rotate(45deg) scale(1); }
          100% { transform: translateX(-466%) rotate(45deg) scale(0); }
        }
      </style>

      <div class="looping-rhombuses-spinner">
        <div class="rhombus"></div>
        <div class="rhombus"></div>
        <div class="rhombus"></div>
      </div>
    `;
  }
}

customElements.define(LoopingRhombusesSpinner.is, LoopingRhombusesSpinner);
