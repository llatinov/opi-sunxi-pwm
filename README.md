# opi-sunxi-pwm
Orange Pi has one PWM pin which is PA5. It is not part of the GPIO pins, but is middle pin of 'Debug TTL UART' interface. This project allows acccess to it with Node.js. Basically this is Node.js wrapper for project: <a href="https://github.com/iboguslavsky/pwm-sunxi-opi0">https://github.com/iboguslavsky/pwm-sunxi-opi0</a>.

## Contents

 * [Installation](#installation)
 * [Usage](#usage)

## Installation

### Install pwm-sunxi-opi0 loadable Kernel module
First step is to install 'pwm-sunxi-opi0' loadable Kernel module:

```bash
git clone https://github.com/iboguslavsky/pwm-sunxi-opi0.git
cd pwm-sunxi-opi0
make
sudo insmod ./pwm-sunxi-opi0.ko
```

Once loaded, the following directory structure will be created:
<pre>
/sys
  └─ /class
      └─ /pwm-sunxi-opi0
          └─ /pwm0
              ├── activecycles
              ├── entirecycles
              ├── freqperiod
              ├── polarity
              ├── prescale
              └── run
</pre>
<b>Important Note:</b> Above installation steps are simplified version of original ones as those worked for Orange Pi PC. Original installation includes FEX pin remapping. If current installation does not work, please follow the full installation guide: <a href="https://github.com/iboguslavsky/pwm-sunxi-opi0#Installation">pwm-sunxi-opi0#Installation</a>.
Another side effect of simplified installation is on each restart loadable module is unloaded and has to be loaded with:

```bash
sudo insmod ./pwm-sunxi-opi0.ko
```

### Install NPM package
Install NPM package with save to package.json

```bash
npm install opi-sunxi-pwm --save
```

## API

### enable()
Enables PWM for writing and writes value for entirecycles. Has to be called in order to be able to write values to PWM.

### disable()
Disables  PWM and cleans up values for entirecycles and activecycles. It is good to be called as clean up after code has finished.

### write(percentValue)
Writes to PWM a percent value. It accept decimal values from 0 to 100, where 100 is full power. The bigger entirecycles value is and the more decimal places are given here the finer the control is.

### set entireCycles(intValue)
Setter that sets custom value for entirecycles. This is the number of ticks in one PWM period. Accepted values are from 255 to 65355, default value is 1023. The bigger the vaSetter has to be called before enable() in order to take effect. 

## Usage
Assume that there's an LED on PA5 - middle pin of Debug TTL UART interface. Code bellow make the LED pulse.

When the button is pressed the LED should turn on, when it's released the LED should turn off. This can be achieved with the following code:

```javascript
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
```

There is clean up code in the example which cancels setInterval and disables PWM.