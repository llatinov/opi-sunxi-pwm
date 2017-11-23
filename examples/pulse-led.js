'use strict';

const pwm = require('../opi-sunxi-pwm.js');
let activeCycle = 0;
let offset = 1;

pwm.enable();

const timeout = setInterval(() => {
  pwm.write(activeCycle);

  activeCycle += offset;
  if (activeCycle >= 100) {
    offset = -1;
  }

  if (activeCycle <= 0) {
    offset = 1;
  }
}, 10);

process.on('SIGINT', () => {
  clearInterval(timeout);
  pwm.disable();
});

