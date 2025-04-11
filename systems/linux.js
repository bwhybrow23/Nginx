/* eslint-disable no-undef */
import fs from 'fs';
import { exec } from 'child_process';
import prompt from 'prompt';

/**
 * OS-Specific Defaults
 */
const distroDefaults = {
  debian: {
    phpSocket: (ver) => `/var/run/php/php${ver}-fpm.sock`,
    nginxSitesAvailable: '/etc/nginx/sites-available/',
    nginxSitesEnabled: '/etc/nginx/sites-enabled/',
  },
  ubuntu: {
    phpSocket: (ver) => `/var/run/php/php${ver}-fpm.sock`,
    nginxSitesAvailable: '/etc/nginx/sites-available/',
    nginxSitesEnabled: '/etc/nginx/sites-enabled/',
  },
  centos: {
    phpSocket: () => `/var/run/php-fpm/www.sock`,
    nginxSitesAvailable: '/etc/nginx/conf.d/',
    nginxSitesEnabled: '/etc/nginx/conf.d/',
  },
  rhel: {
    phpSocket: () => `/var/run/php-fpm/www.sock`,
    nginxSitesAvailable: '/etc/nginx/conf.d/',
    nginxSitesEnabled: '/etc/nginx/conf.d/',
  },
  arch: {
    phpSocket: () => `/run/php-fpm/php-fpm.sock`,
    nginxSitesAvailable: '/etc/nginx/sites-available/',
    nginxSitesEnabled: '/etc/nginx/sites-enabled/',
  }
};

/**
 * Constructor for Linux
 */
class linuxOS {
  constructor(distroDetect) {
    // Pull distro from index.js and match the config
    const distro = distroDetect;
    this.config = distroDefaults[distro];

    // Start prompt in command line
    prompt.start();
    const options = {};

    // Check script is ran with sudo or has root privileges
    if (process.getuid() != 0) {
      console.log("Please run this script with sudo.");
      return process.exit();
    }

    // Check whether Nginx is installed
    exec('nginx -v', (error) => {
      if (error) { 
        console.log("Nginx is not installed - please install this using the applicable package manager and try again.")
        return process.exit();
      }
    })

    // Prompt 1 - Installation Type
    prompt.get([{
      name: "choice",
      description: "Select installation type:\n[1] Standard\n[2] Reverse Proxy\n[3] PHP\n[4] Static\n[5] Redirect\n[6] Remove\nChoice: ",
      required: true,
      type: "string",
      pattern: /^[1-6]$/
    }], (err, result) => {
      if (err) return console.log("Error: ", err);

      options.choice = result.choice;

      switch (options.choice) {
        case "1":
          this.standardPrompt(options);
          break;
        case "2":
          this.reverseProxyPrompt(options);
          break;
        case "3":
          this.phpPrompt(options);
          break;
        case "4":
          this.staticPrompt(options);
          break;
        case "5":
          this.redirectPrompt(options);
          break;
        case "6":
          this.removePrompt(options);
          break;
        default:
          console.log("Invalid choice.");
      }
    });
  }

  /**
   * Prompt Functions
   */
  standardPrompt(options) {
    prompt.get([
      { name: "root_dir", description: "Root directory", default: "/var/www/html", required: true },
      { name: "server_name", description: "Server name", required: true },
      { name: "ssl_install", description: "Install SSL? (y/n)", required: true }
    ], (err, result) => {
      if (err) return console.log("Error:", err);
      Object.assign(options, result);
      this.standard(options);
    });
  }

  reverseProxyPrompt(options) {
    prompt.get([
      { name: "server_name", description: "Server name", required: true },
      { name: "source_host", description: "Source host", default: "localhost", required: true },
      { name: "source_port", description: "Source port", default: "3001", required: true },
      { name: "source_ssl", description: "Source SSL (http|https)", required: true },
      { name: "ssl_install", description: "Install SSL? (y/n)", required: true }
    ], (err, result) => {
      if (err) return console.log("Error:", err);
      Object.assign(options, result);
      this.reverse(options);
    });
  }

  phpPrompt(options) {
    prompt.get([
      { name: "root_dir", description: "Root directory", default: "/var/www/html", required: true },
      { name: "server_name", description: "Server name", required: true },
      { name: "php_version", description: "PHP-FPM version", default: "7.2", required: true },
      { name: "ssl_install", description: "Install SSL? (y/n)", required: true }
    ], (err, result) => {
      if (err) return console.log("Error:", err);
      Object.assign(options, result);
      this.php(options);
    });
  }

  staticPrompt(options) {
    prompt.get([
      { name: "root_dir", description: "Root directory", default: "/var/www/html", required: true },
      { name: "server_name", description: "Server name", required: true },
      { name: "ssl_install", description: "Install SSL? (y/n)", required: true }
    ], (err, result) => {
      if (err) return console.log("Error:", err);
      Object.assign(options, result);
      this.staticVH(options);
    });
  }

  redirectPrompt(options) {
    prompt.get([
      { name: "server_name", description: "Server name", required: true },
      { name: "redirect_link", description: "Redirect URL", required: true },
      { name: "ssl_install", description: "Install SSL? (y/n)", required: true }
    ], (err, result) => {
      if (err) return console.log("Error:", err);
      Object.assign(options, result);
      this.redirect(options);
    });
  }

  removePrompt(options) {
    prompt.get([
      { name: "file_name", description: "Config file name", required: true },
      { name: "server_name", description: "Server name", required: true }
    ], (err, result) => {
      if (err) return console.log("Error:", err);
      Object.assign(options, result);
      this.remove(options);
    });
  }

  /**
   * Utility Methods
   */
  symlink(server_name) {
    return new Promise((resolve, reject) => {
      // Fetch paths from config
      const { nginxSitesAvailable, nginxSitesEnabled } = this.config;
      // Check if symlink is needed (centos uses conf.d)
      if (nginxSitesAvailable === nginxSitesEnabled) resolve("Symlink not needed");
      // Create symlink
      exec(`ln -s ${nginxSitesAvailable}${server_name} ${nginxSitesEnabled}`, (err, stdout, stderr) => {
        if (err || stderr) return reject(Error(err?.message || stderr));
        resolve("Symlink created!");
      });
    });
  }

  install_ssl(server_name) {
    return new Promise((resolve, reject) => {
      exec(`certbot --nginx -d ${server_name}`, (err, stdout, stderr) => {
        if (err || stderr) return reject(Error(err?.message || stderr));
        resolve("SSL Installed!");
      });
    });
  }

  restart_nginx() {
    return new Promise((resolve, reject) => {
      exec(`systemctl reload nginx`, (err, stdout, stderr) => {
        if (err || stderr) return reject(Error(err?.message || stderr));
        resolve("NGINX Reloaded!");
      });
    });
  }

  /**
   * Virtual Host Methods
   */
  standard(options) {
    return this._writeConfig(options, `server {
  listen 80;
  listen [::]:80;
  root ${options.root_dir};
  index index.php index.html index.htm;
  server_name ${options.server_name};

  location / {
    try_files $uri $uri/ =404;
  }
}`);
  }

  reverse(options) {
    return this._writeConfig(options, `server {
  listen 80;
  listen [::]:80;
  server_name ${options.server_name};

  location / {
    proxy_pass ${options.source_ssl}://${options.source_host}:${options.source_port};
  }
}`);
  }

  php(options) {
    const socket = this.config.phpSocket(options.php_version);
    return this._writeConfig(options, `server {
  listen 80;
  listen [::]:80;
  root ${options.root_dir};
  index index.php index.html index.htm;
  server_name ${options.server_name};

  location / {
    try_files $uri $uri/ =404;
  }

  location ~* \\.php$ {
    fastcgi_pass unix:${socket};
    fastcgi_index index.php;
    fastcgi_split_path_info ^(.+\\.php)(.*)$;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_param PATH_INFO $fastcgi_path_info;
  }
}`);
  }

  staticVH(options) {
    return this._writeConfig(options, `server {
  listen 80;
  listen [::]:80;
  server_name ${options.server_name};
  root ${options.root_dir};
  index index.php index.html index.htm;

  location / {
    try_files $uri $uri/ /index.html;
    autoindex on;
  }

  location ~ .*/\\. {
    return 403;
  }
}`);
  }

  redirect(options) {
    return this._writeConfig(options, `server {
  listen 80;
  listen [::]:80;
  server_name ${options.server_name};
  rewrite ^/(.*)$ ${options.redirect_link} permanent;
}`);
  }

  // Remove method
  remove(options) {
    const { nginxSitesAvailable, nginxSitesEnabled } = this.config;
    exec(`rm ${nginxSitesAvailable}${options.file_name}`, () => {});
    exec(`rm ${nginxSitesEnabled}${options.file_name}`, () => {});
    exec(`certbot delete --cert-name ${options.server_name}`, () => {});
    this.restart_nginx().then(console.log);
  }

  _writeConfig(options, configStr) {
    const { nginxSitesAvailable } = this.config;
    const filePath = `${nginxSitesAvailable}${options.server_name}`;

    fs.writeFile(filePath, configStr, { flag: 'w+' }, (err) => {
      if (err) return console.log("Error:", err);
      console.log("NGINX File Created");
      this.symlink(options.server_name).then(console.log);
      if (options.ssl_install === "y") this.install_ssl(options.server_name).then(console.log);
      this.restart_nginx().then(console.log);
    });
  }
}

export { linuxOS };