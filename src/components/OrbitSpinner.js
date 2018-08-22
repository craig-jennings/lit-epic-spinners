import { html, LitElement } from '@polymer/lit-element';

export class OrbitSpinner extends LitElement {
  static get is() { return 'orbit-spinner'; }

  static get properties() {
    return {
      animationDuration: Number,
      color: String,
      size: String,
    };
  }

  constructor() {
    super();

    this.animationDuration = 1.2;
    this.color = '#ff1d5e';
    this.size = '55px';
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

       .orbit-spinner {
          border-radius: 50%;
          height: ${this.size};
          perspective: 800px;
          width: ${this.size};
        }

        .orbit-spinner .orbit {
          border-radius: 50%;
          box-sizing: border-box;
          height: 100%;
          position: absolute;
          width: 100%;
        }

        .orbit-spinner .orbit:nth-child(1) {
          animation: orbit-spinner-orbit-one-animation ${this.animationDuration}s linear infinite;
          border-bottom: 3px solid ${this.color};
          left: 0%;
          top: 0%;
        }

        .orbit-spinner .orbit:nth-child(2) {
          animation: orbit-spinner-orbit-two-animation ${this.animationDuration}s linear infinite;
          border-right: 3px solid ${this.color};
          right: 0%;
          top: 0%;
        }

        .orbit-spinner .orbit:nth-child(3) {
          animation: orbit-spinner-orbit-three-animation ${this.animationDuration}s linear infinite;
          border-top: 3px solid ${this.color};
          bottom: 0%;
          right: 0%;
        }

        @keyframes orbit-spinner-orbit-one-animation {
          0%   { transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg); }
          100% { transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg); }
        }

        @keyframes orbit-spinner-orbit-two-animation {
          0%   { transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg); }
          100% { transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg); }
        }

        @keyframes orbit-spinner-orbit-three-animation {
          0%   { transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg); }
          100% { transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
          }
        }
      </style>

      <div class="orbit-spinner">
        <div class="orbit"></div>
        <div class="orbit"></div>
        <div class="orbit"></div>
      </div>
    `;
  }
}

customElements.define(OrbitSpinner.is, OrbitSpinner);
