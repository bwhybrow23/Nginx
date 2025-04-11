#!/usr/bin/env node

//File Imports
const { ubuntuOS } = require('./systems/debian');
const { windowsOS } = require('./systems/windows');
// const { macOS } = require('./systems/mac');

//OS => correct file to run
const os = process.platform;
const distro = fs.readFileSync('/etc/os-release', 'utf8');

switch (os) {
  case "win32":
    
    //Windows
    // new windowsOS();
    console.log("Currently this doesn't support Windows. The support for NGINX and Certbot isn't great enough to consider it. If you are interested, please contact me.");

    break;

  case "linux":

    //Check if Ubuntu
    if(distro.includes("Ubuntu") || distro.includes("Debian")) {
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