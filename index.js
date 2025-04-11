#!/usr/bin/env node
import fs from 'fs';

//File Imports
import { linuxOS } from './systems/linux';
// import { windowsOS } from './systems/windows';

//OS => correct file to run
// eslint-disable-next-line no-undef
const os = process.platform;

switch (os) {
  case "win32": {
    
    //Windows
    // new windowsOS();
    console.log("Currently this doesn't support Windows. The support for NGINX and Certbot isn't great enough to consider it. If you are interested, please contact me.");

    break;
  }

  case "linux": {

    let distro = detectOS();
    if (distro != 'unknown') {
      linuxOS(distro)
    } else {
      console.log("Currently, this Linux distro is not supported. If you think it should be, please open an issue on GitHub.");
    }
  
    break;
  }

  case "darwin": {

    //MacOS
    console.log("Currently this doesn't support MacOS. The support for NGINX and Certbot isn't great enough to consider it. If you are interested, please contact me.");

    break;
  }

  default: {

    //Unsupported OS
    console.log("Currently this OS is not supported. If you think it should be, please open an issue on GitHub.");

    break;
  }
}

function detectOS() {
  const releaseFile = fs.readFileSync('/etc/os-release', 'utf8');
  if (releaseFile.includes('Debian')) return 'debian';
  if (releaseFile.includes('Ubuntu')) return 'ubuntu';
  if (releaseFile.includes('CentOS')) return 'centos';
  if (releaseFile.includes('Red Hat')) return 'rhel';
  if (releaseFile.includes('Arch')) return 'arch';
  return 'unknown';
}