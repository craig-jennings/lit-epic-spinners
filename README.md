# Lit Epic Spinners
[![npm](https://img.shields.io/npm/v/lit-epic-spinners.svg?style=popout-square)](https://www.npmjs.com/package/lit-epic-spinners)
[![npm](https://img.shields.io/npm/l/lit-epic-spinners.svg?style=popout-square)](https://github.com/craigjennings11/lit-epic-spinners/blob/master/LICENSE)

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

or for a specific spinner

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

or for a specific spinner

```html
<body>
  <atom-spinner></atom-spinner>

  <script src="lit-epic-spinners/dist/AtomSpinner.js"></script>
</body>
```

## Configuration

You can easily configure a spinner's size, color, and animation speed by either setting an attribute on the spinner element or by assigning a value to a corresponding css variable.

### Attributes

```html
<atom-spinner
  color="#ff1d5e"
  duration="1"
  size="60"
></atom-spinner>
```

### CSS Variables (CSS Custom Properties)

```html
<style>
  :root {
    --atom-spinner-duration: 1s;
    --atom-spinner-color: #ff1d5e;
    --atom-spinner-size: 60px;
  }
</style>

<atom-spinner></atom-spinner>
```

## Components list


```html
<atom-spinner
  color="#ff1d5e"
  duration="1"
  size="60"
></atom-spinner>

<breeding-rhombus-spinner
  color="#ff1d5e"
  duration="2"
  size="65"
></breeding-rhombus-spinner>

<circles-to-rhombuses-spinner
  color="#ff1d5e"
  duration="1.2"
  numCircles="3"
  size="15"
></circles-to-rhombuses-spinner>

<fingerprint-spinner
  color="#ff1d5e"
  duration="1.5"
  size="64"
></fingerprint-spinner>

<flower-spinner
  color="#ff1d5e"
  duration="2.5"
  size="70"
></flower-spinner>

<fulfilling-bouncing-circle-spinner
  color="#ff1d5e"
  duration="4"
  size="60"
></fulfilling-bouncing-circle-spinner>

<fulfilling-square-spinner
  color="#ff1d5e"
  duration="4"
  size="50"
></fulfilling-square-spinner>

<half-circle-spinner
  color="#ff1d5e"
  duration="1"
  size="60"
></half-circle-spinner>

<hollow-dots-spinner
  color="#ff1d5e"
  duration="1"
  numDots="3"
  size="15"
></hollow-dots-spinner>

<intersecting-circles-spinner
  color="#ff1d5e"
  duration="1.2"
  size="70"
></intersecting-circles-spinner>

<looping-rhombuses-spinner
  color="#ff1d5e"
  duration="2.5"
  size="15"
></looping-rhombuses-spinner>

<orbit-spinner
  color="#ff1d5e"
  duration="1.2"
  size="55"
></orbit-spinner>

<pixel-spinner
  color="#ff1d5e"
  duration="2"
  size="70"
></pixel-spinner>

<radar-spinner
  color="#ff1d5e"
  duration="2"
  size="60"
></radar-spinner>

<scaling-squares-spinner
  color="#ff1d5e"
  duration="1.25"
  size="65"
></scaling-squares-spinner>

<self-building-square-spinner
  color="#ff1d5e"
  duration="6"
  size="40"
></self-building-square-spinner>

<semipolar-spinner
  color="#ff1d5e"
  duration="2"
  size="65"
></semipolar-spinner>

<spring-spinner
  color="#ff1d5e"
  duration="3"
  size="60"
></spring-spinner>

<swapping-squares-spinner
  color="#ff1d5e"
  duration="1"
  size="65"
></swapping-squares-spinner>

<trinity-rings-spinner
  color="#ff1d5e"
  duration="1.5"
  size="66"
></trinity-rings-spinner>
```

## Support?
- Star the repo :star:
- Create pull requests 

## License
[MIT](https://github.com/craigjennings11/lit-epic-spinners/blob/master/LICENSE) license.
