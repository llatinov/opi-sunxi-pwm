'use strict';

const fs = require('fs');
const assert = require('assert');
const sinon = require('sinon');
const pwm = require('../opi-sunxi-pwm.js');

describe('opi-sunxi-pwm', () => {
  let sandbox;
  let writeFileSync;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    writeFileSync = sandbox.stub(fs, 'writeFileSync');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('entireCycles', () => {
    it('default value is 1023', () => {
      assert.equal(pwm.cycles, 1023);
    });
    
    it('throws error on 254', () => {
      assert.throws(() => pwm.entireCycles = 254, (err) => {
        if ((err instanceof Error) && /Expected integer value between 255 and 65535/.test(err)) return true;
      });
    });

    it('throws error on 65536', () => {
      assert.throws(() => pwm.entireCycles = 65536, (err) => {
        if ((err instanceof Error) && /Expected integer value between 255 and 65535/.test(err)) return true;
      });
    });
  });

  describe('enable', () => {
    it('this.enabled is false if enable() is not called',() => {
      assert.equal(pwm.enabled, false);
    });

    it('this.enabled is true if enable() is called',() => {
      pwm.enable();

      assert.equal(pwm.enabled, true);
    });

    it('should write to "run" and "entirecycles" files', () => {
      pwm.enable();

      sandbox.assert.calledTwice(writeFileSync);
      sandbox.assert.calledWith(writeFileSync, '/sys/class/pwm-sunxi-opi0/pwm0/run', 1);
      sandbox.assert.calledWith(writeFileSync, '/sys/class/pwm-sunxi-opi0/pwm0/entirecycles', 1023);
    });

    it('enable should write new entireCycles value', () => {
      pwm.entireCycles = 65400;
      pwm.enable();

      sandbox.assert.calledTwice(writeFileSync);
      sandbox.assert.calledWith(writeFileSync, '/sys/class/pwm-sunxi-opi0/pwm0/run', 1);
      sandbox.assert.calledWith(writeFileSync, '/sys/class/pwm-sunxi-opi0/pwm0/entirecycles', 65400);
    });
  });

  describe('disable', () => {
    it('this.enabled is false if disable() is called',() => {
      pwm.enabled = true;
      pwm.disable();

      assert.equal(pwm.enabled, false);
    });

    it('should write to "run" and "entirecycles" files', () => {
      pwm.disable();

      sandbox.assert.calledTwice(writeFileSync);
      sandbox.assert.calledWith(writeFileSync, '/sys/class/pwm-sunxi-opi0/pwm0/run', 0);
      sandbox.assert.calledWith(writeFileSync, '/sys/class/pwm-sunxi-opi0/pwm0/entirecycles', 0);
    });
  });

  describe('write', () => {
    it('writes 511 on 50% and 1023 as default',() => {
      pwm.enabled = true;
      pwm.cycles = 1023;
      pwm.write(50);

      sandbox.assert.calledOnce(writeFileSync);
      sandbox.assert.calledWith(writeFileSync, '/sys/class/pwm-sunxi-opi0/pwm0/activecycles', 511);
    });

    it('writes 0 on 0%',() => {
      pwm.write(0);

      sandbox.assert.calledWith(writeFileSync, '/sys/class/pwm-sunxi-opi0/pwm0/activecycles', 0);
    });

    it('writes 1023 on 100%',() => {
      pwm.write(100);

      sandbox.assert.calledWith(writeFileSync, '/sys/class/pwm-sunxi-opi0/pwm0/activecycles', 1023);
    });

    it('writes 1 on 0.01% and 65535',() => {
      pwm.entireCycles = 65535;
      pwm.write(0.01);

      sandbox.assert.calledWith(writeFileSync, '/sys/class/pwm-sunxi-opi0/pwm0/activecycles', 6);
    });

    it('throws exception if not enabled',() => {
      pwm.enabled = false;

      assert.throws(() => pwm.write(50), (err) => {
        if ((err instanceof Error) && /PWM0 write not enabled/.test(err)) return true;
      });
    });

    it('throws exception on -1',() => {
      pwm.enabled = true;

      assert.throws(() => pwm.write(-1), (err) => {
        if ((err instanceof Error) && /Expected decimal value between 0 and 100/.test(err)) return true;
      });
    });

    it('throws exception on 100.01',() => {
      assert.throws(() => pwm.write(100.01), (err) => {
        if ((err instanceof Error) && /Expected decimal value between 0 and 100/.test(err)) return true;
      });
    });
  });
});