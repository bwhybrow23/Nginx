#!/usr/bin/env node
import fs from 'fs';

//File Imports
import { ubuntuOS } from './systems/debian';
// import { windowsOS } from './systems/windows';

//OS => correct file to run
// eslint-disable-next-line no-undef
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
      console.log("At the moment, this OS is not supported.");
    }

  break;

  case "darwin":

    //MacOS
    console.log("Currently this doesn't support MacOS. The support for NGINX and Certbot isn't great enough to consider it. If you are interested, please contact me.");

  break;

  default:

    //Unsupported OS
    console.log("Currently this OS is not supported. If you think it should be, please open an issue on GitHub.");

    break;
}