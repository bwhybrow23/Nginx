#!/usr/bin/env node

/**
 * 
 * Const's
 * 
 */
//Readline
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

//File Imports
const { ubuntuOS } = require('./systems/ubuntu');
const { windowsOS } = require('./systems/windows');
const { macOS } = require('./systems/mac');

//OS => correct file to run
const os = process.platform;

switch (os) {
  case "win32":
    
    //Windows
    // windowsOS();
    console.log("Currently this doesn't support Windows. The support for NGINX and Certbot isn't great enough to consider it. If you are interested, please contact me.");

    break;

  case "linux":

    //Check if Ubuntu
    if(os.version.includes("Ubuntu")) {
      ubuntuOS();
    } else {
      return console.log("At the moment, this OS is not supported.");
    }

  break;

  case "darwin":

    //MacOS
    // macOS();
    console.log("Currently this doesn't support MacOS. The support for NGINX and Certbot isn't great enough to consider it. If you are interested, please contact me.");

  break;

  default:

    //Unsupported OS
    console.log("Currently this OS is not supported. If you think it should be, please open an issue on GitHub.");

    break;
}