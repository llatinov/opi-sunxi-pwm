'use strict';

const fs = require('fs');
const PATH = '/sys/class/pwm-sunxi-opi0/pwm0/';
const FILE_ENABLE = PATH + 'run';
const FILE_ENTIRE_CYCLES = PATH + 'entirecycles';
const FILE_ACTIVE_CYCLES = PATH + 'activecycles';

class PWM {
  constructor() {
    this.cycles = 1023;
    this.enabled = false;
  }

  enable() {
    fs.writeFileSync(FILE_ENABLE, 1);
    fs.writeFileSync(FILE_ENTIRE_CYCLES, this.cycles);
    this.enabled = true;
  }

  disable() {
    fs.writeFileSync(FILE_ENABLE, 0);
    fs.writeFileSync(FILE_ENTIRE_CYCLES, 0);
    this.enabled = false;
  }

  pwmWrite(value) {
    if (!this.enabled) {
      throw new Error('PWM0 write not enabled');
    }
    if (value < 0 || value > 100) {
      throw new Error('Expected decimal value between 0 and 100');
    }
    value = parseInt(value * this.cycles / 100);
    fs.writeFileSync(FILE_ACTIVE_CYCLES, value);
  }

  set entireCycles(value) {
    value = parseInt(value);
    if (value < 255 || value > 65535) {
      throw new Error('Expected integer value between 255 and 65535');
    }
    this.cycles = value;
  }
}

const pwm = new PWM();

module.exports = pwm;