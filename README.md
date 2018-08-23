# Lit Epic Spinners
[![npm](https://img.shields.io/npm/dm/lit-epic-spinners.svg)]() [![npm](https://img.shields.io/npm/l/lit-epic-spinners.svg)]() [![npm](https://img.shields.io/npm/v/lit-epic-spinners.svg)]()

Web Component implementations of [epic-spinners](https://github.com/epicmaxco/epic-spinners) by [EpicMax](http://epic-spinners.epicmax.co/)

## Installation

`npm install --save lit-epic-spinners`

OR

`yarn add lit-epic-spinners`

## Usage

### Javascript

```js  
  import 'lit-epic-spinners';
  
  const spinner = document.createElement('atom-spinner');
  document.body.append(spinner);
```

OR for a specific spinner

```js
  import 'lit-epic-spinners/dist/AtomSpinner.js';

  const spinner = document.createElement('atom-spinner');
  document.body.append(spinner);
```

### HTML

```html
<body>
  <atom-spinner></atom-spinner>

  <script src="lit-epic-spinners.js"></script>
</body>
```

OR for a specific spinner

```html
<body>
  <atom-spinner></atom-spinner>

  <script src="lit-epic-spinners/dist/AtomSpinner.js"></script>
</body>
```

## Components list
You can easily configure a spinner's size, color, and animation speed

```html
<atom-spinner
  animationDuration="1000"
  color="#ff1d5e"
  size="60px"
></atom-spinner>

<breeding-rhombus-spinner
  animationDuration="2000"
  color="#ff1d5e"
  size="65px"
></breeding-rhombus-spinner>

<circles-to-rhombuses-spinner
  animationDuration="1200"
  numCircles="3"
  color="#ff1d5e"
  size="15px"
></circles-to-rhombuses-spinner>

<fingerprint-spinner
  animationDuration="1500"
  color="#ff1d5e"
  size="64px"
></fingerprint-spinner>

<flower-spinner
  animationDuration="2500"
  color="#ff1d5e"
  size="70px"
></flower-spinner>

<fulfilling-bouncing-circle-spinner
  animationDuration="4000"
  color="#ff1d5e"
  size="60px"
></fulfilling-bouncing-circle-spinner>

<fulfilling-square-spinner
  animationDuration="4000"
  color="#ff1d5e"
  size="50px"
></fulfilling-square-spinner>

<half-circle-spinner
  animationDuration="1000"
  color="#ff1d5e"
  size="60px"
></half-circle-spinner>

<hollow-dots-spinner
  animationDuration="1000"
  color="#ff1d5e"
  numDots="3"
  size="15px"
></hollow-dots-spinner>

<intersecting-circles-spinner
  animationDuration="1200"
  color="#ff1d5e"
  size="70px"
></intersecting-circles-spinner>

<looping-rhombuses-spinner
  animationDuration="2500"
  color="#ff1d5e"
  size="15px"
></looping-rhombuses-spinner>

<orbit-spinner
  animationDuration="1200"
  color="#ff1d5e"
  size="55px"
></orbit-spinner>

<pixel-spinner
  animationDuration="2000"
  color="#ff1d5e"
  size="70px"
></pixel-spinner>

<radar-spinner
  animationDuration="2000"
  color="#ff1d5e"
  size="60px"
></radar-spinner>

<scaling-squares-spinner
  animationDuration="1250"
  color="#ff1d5e"
  size="65px"
></scaling-squares-spinner>

<self-building-square-spinner
  animationDuration="6000"
  color="#ff1d5e"
  size="40px"
></self-building-square-spinner>

<semipolar-spinner
  animationDuration="2000"
  color="#ff1d5e"
  size="65px"
></semipolar-spinner>

<spring-spinner
  animationDuration="3000"
  color="#ff1d5e"
  size="60px"
></spring-spinner>

<swapping-squares-spinner
  animationDuration="1000"
  color="#ff1d5e"
  size="65px"
></swapping-squares-spinner>

<trinity-rings-spinner
  animationDuration="1500"
  color="#ff1d5e"
  size="66px"
></trinity-rings-spinner>
```

## Support?
- Star the repo :star:
- Create pull requests 

## License
[MIT](https://github.com/craigjennings11/lit-epic-spinners/blob/master/LICENSE) license.
