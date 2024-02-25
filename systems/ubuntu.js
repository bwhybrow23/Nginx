//Global Variables
const fs = require("fs");
const { exec } = require("child_process");
const prompt = require('prompt');

/** 
 * 
 * Install Choice
 * Choices: Standard, Reverse Proxy, PHP, Static, Redirect, Remove
 * 
 */
class ubuntuOS {
  constructor() {

    //Prompt
    prompt.start();

    let options = {};

    //Check whether the script has been ran with sudo (UID of Root is always 0). If not, exit with error
    if (process.getuid() != 0) {
      console.log("This script has to be ran using sudo as it is editing protected Nginx files. Please run the script again, but prefix it with \"sudo\"");
      return process.exit();
    }

    //Installation Type
    prompt.get([{
      name: "choice",
      description: "Please select an installation type: \n[1] Standard VirtualHost \n[2] Basic Reverse Proxy \n[3] Basic PHP VirtualHost \n[4] Static VirtualHost \n[5] Redirect Virtual Host \n[6] Remove Virtual Host \nChoice: ",
      required: true,
      type: "string",
      pattern: /^[1-6]+$/
    }], function (err, result) {

      //Error Handling
      if (err) {
        return console.log("Error: ", err);
      };

      options.choice = result.choice;

      //Switch based on above choice
      switch (options.choice) {
        // Standard VirtualHost
        case "1":
          prompt.get([{
            name: "root_dir",
            description: "Enter root directory (/var/www/html):",
            required: true,
            default: "/var/www/html",
            type: "string"
          }, {
            name: "server_name",
            description: "Enter server_name (test.benwhybrow.com):",
            required: true,
            type: "string"
          }, {
            name: "ssl_install",
            description: "Would you like SSL installed? (y|n):",
            required: true,
            type: "string"
          }], function (err, result) {

            //Error Handling
            if (err) {
              return console.log("Error: ", err);
            };

            options.root_dir = result.root_dir;
            options.server_name = result.server_name;
            options.ssl_install = result.ssl_install;

            standard(options).then((result) => {
              console.log(result)
              console.log("VirtualHost Installation Complete!");
            })

          });
          break;
    
        // Basic Reverse Proxy
        case "2":
          prompt.get([{
            name: "server_name",
            description: "Enter server_name (test.benwhybrow.com):",
            required: true,
            type: "string"
          }, {
            name: "source_host",
            description: "Enter source host (localhost):",
            required: true,
            default: "localhost",
            type: "string"
          }, {
            name: "source_port",
            description: "Enter source port (3001):",
            required: true,
            default: "3001",
            type: "number"
          }, {
            name: "source_ssl",
            description: "Enter source SSL (http|https):",
            required: true,
            type: "string"
          }, {
            name: "ssl_install",
            description: "Would you like SSL installed? (y|n):",
            required: true,
            type: "string"
          }], function (err, result) {

            //Error Handling
            if (err) {
              return console.log("Error: ", err);
            };

            options.server_name = result.server_name;
            options.source_host = result.source_host;
            options.source_port = result.source_port;
            options.source_ssl = result.source_ssl;
            options.ssl_install = result.ssl_install;

            reverse(options).then((result) => {
              console.log(result)
              console.log("VirtualHost Installation Complete!");
            })

          });
          break;
    
        // Basic PHP VirtualHost
        case "3":
          prompt.get([{
            name: "root_dir",
            description: "Enter root directory (/var/www/html):",
            required: true,
            default: "/var/www/html",
            type: "string"
          }, {
            name: "server_name",
            description: "Enter server_name (test.benwhybrow.com):",
            required: true,
            type: "string"
          }, {
            name: "php_version",
            description: "Enter your php-fpm version (7.2):",
            required: true,
            default: "7.2",
            type: "string"
          }, {
            name: "ssl_install",
            description: "Would you like SSL installed? (y|n):",
            required: true,
            type: "string"
          }], function (err, result) {

            //Error Handling
            if (err) {
              return console.log("Error: ", err);
            };

            options.root_dir = result.root_dir;
            options.server_name = result.server_name;
            options.php_version = result.php_version;
            options.ssl_install = result.ssl_install;

            php(options).then((result) => {
              console.log(result)
              console.log("VirtualHost Installation Complete!");
            })

          });
          break;
    
        // Static VirtualHost
        case "4":
          prompt.get([{
            name: "root_dir",
            description: "Enter root directory (/var/www/html):",
            required: true,
            default: "/var/www/html",
            type: "string"
          }, {
            name: "server_name",
            description: "Enter server_name (test.benwhybrow.com):",
            required: true,
            type: "string"
          }, {
            name: "ssl_install",
            description: "Would you like SSL installed? (y|n):",
            required: true,
            type: "string"
          }], function (err, result) {

            //Error Handling
            if (err) {
              return console.log("Error: ", err);
            };

            options.root_dir = result.root_dir;
            options.server_name = result.server_name;
            options.ssl_install = result.ssl_install;

            staticVH(options).then((result) => {
              console.log(result)
              console.log("VirtualHost Installation Complete!");
            })

          });
          break;
    
        // Redirect VirtualHost
        case "5":
          prompt.get([{
            name: "server_name",
            description: "Enter server_name (test.benwhybrow.com):",
            required: true,
            type: "string"
          }, {
            name: "redirect_link",
            description: "Enter the link to redirect to (new.benwhybrow.com):",
            required: true,
            type: "string"
          }, {
            name: "ssl_install",
            description: "Would you like SSL installed? (y|n):",
            required: true,
            type: "string"
          }], function (err, result) {

            //Error Handling
            if (err) {
              return console.log("Error: ", err);
            };

            options.server_name = result.server_name;
            options.redirect_link = result.redirect_link;
            options.ssl_install = result.ssl_install;

            redirect(options).then((result) => {
              console.log(result)
              console.log("VirtualHost Installation Complete!");
            })

          });
          break;
    
        // Remove VirtualHost
        case "6":
          prompt.get([{
            name: "file_name",
            description: "Enter the config file name (test.benwhybrow.com):",
            required: true,
            type: "string"
          }, {
            name: "server_name",
            description: "Enter the server name (test.benwhybrow.com):",
            required: true,
            type: "string"
          }], function (err, result) {

            //Error Handling
            if (err) {
              return console.log("Error: ", err);
            };

            options.file_name = result.file_name;
            options.server_name = result.server_name;

            remove(options).then((result) => {
              console.log(result)
              console.log("VirtualHost Removal Complete!");
            })

          });
          break;
    
        default:
          console.log("Invalid option choice");
          break;
      }

        });

/**
 * 
 * Create symlink
 * 
 */
symlink() = (server_name) => {
  return new Promise((resolve, reject) => {
    exec(`sudo ln -s /etc/nginx/sites-available/${server_name} /etc/nginx/sites-enabled/`, (err, stdout, stderr) => {
      if (err) {
        reject(Error(`${err.message}`));
        return;
      }
      if (stderr) {
        reject(Error(`${stderr}`));
        return;
      }
      return resolve("Symlink created!");
      // return resolve(stdout);
    });
  })
}

/**
 * 
 * SSL Install
 * 
 */
install_ssl() = (server_name) => {
  return new Promise((resolve, reject) => {
    exec(`sudo certbot --nginx -d ${server_name}`, (err, stdout, stderr) => {
      if (err) {
        reject(Error(`${err.message}`));
        return;
      }
      if (stderr) {
        reject(Error(`${stderr}`));
        return;
      }
      return resolve("SSL Installed!");
    });
  })
}

/** 
 * 
 * Restart NGINX
 * 
 */
restart_nginx() = () => {
  return new Promise((resolve, reject) => {
    console.log("Restarting NGINX");
    exec(`sudo systemctl reload nginx`, (err, stdout, stderr) => {
      if (err) {
        reject(Error(`${err.message}`));
        return;
      }
      if (stderr) {
        reject(Error(`${stderr}`));
        return;
      }
      return resolve("NGINX Restarted!");
    })
  })
}

/** 
 * 
 * Standard VirtualHost 
 * 
 */
standard() = async (options) => {
  return new Promise((resolve, reject) => {
    let root_dir = options.root_dir;
    let server_name = options.server_name;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    root ${root_dir};\n    index index.php index.html index.htm index.nginx-debian.html;\n    server_name ${server_name};\n\n    location \/ {\n        try_files \\$uri \\$uri\/ =404;\n    }\n}`;

    fs.writeFile(`/etc/nginx/sites-available/${server_name}`, data, {
      flag: 'w+'
    }, function(err) {
      console.log("NGINX File Created");
      if (err) {
        return reject(Error(err));
      }

      //Symlink
      symlink(server_name).then((message) => console.log(message));

      //SSL
      if (ssl_install === "y") {
        install_ssl(server_name).then((message) => console.log(message));
      } else if (ssl_install === "n") {
        console.log("Skipping SSL Install");
      }

      //Restart NGINX
      restart_nginx().then((message) => console.log(message));
      return resolve();
    });
  });
}

/** 
 * 
 * Basic Reverse Proxy VirtualHost 
 * 
 */
reverse() = async (options) => {
  return new Promise((resolve, reject) => {
    let server_name = options.server_name;
    let source_host = options.source_host;
    let source_port = options.source_port;
    let source_ssl = options.source_ssl;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    server_name ${server_name};\n\n    location \/ {\n        proxy_pass ${source_ssl}:\/\/${source_host}:${source_port};\n\n    }\n}`;

    fs.writeFile(`/etc/nginx/sites-available/${server_name}`, data, {
      flag: 'w+'
    }, function(err) {
      console.log("NGINX File Created");
      if (err) {
        return reject(Error(err));
      }

      symlink(server_name).then((message) => console.log(message));

      //SSL
      if (ssl_install === "y") {
        install_ssl(server_name).then((message) => console.log(message));
      } else if (ssl_install === "n") {
        console.log("Skipping SSL Install");
      }

      //Restart NGINX
      restart_nginx().then((message) => console.log(message));
      return resolve();

    });

  });
}

/** 
 * 
 * Basic PHP VirtualHost 
 * 
 */
php() = (options) => {
  return new Promise((resolve, reject) => {
    let root_dir = options.root_dir;
    let server_name = options.server_name;
    let php_version = options.php_version;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    root ${root_dir};\n    index index.php index.html index.htm index.nginx-debian.html;\n    server_name ${server_name};\n\n    location \/ {\n        try_files $uri $uri\/ =404;\n    }\n\n    location ~* \\.php$ {\n            fastcgi_pass                    unix:\/var\/run\/php\/php${php_version}-fpm.sock;\n            fastcgi_index                   index.php;\n            fastcgi_split_path_info         ^(.+\\.php)(.*)$;\n            include                         fastcgi_params;\n            fastcgi_param PATH_INFO         \\$fastcgi_path_info;\n            fastcgi_param SCRIPT_FILENAME   \\$document_root\\$fastcgi_script_name;\n    }\n\n}`;

    fs.writeFile(`/etc/nginx/sites-available/${server_name}`, data, {
      flag: 'w+'
    }, function(err) {
      console.log("NGINX File Created");
      if (err) {
        return reject(Error(err));
      }

      symlink(server_name).then((message) => console.log(message));

      //SSL
      if (ssl_install === "y") {
        install_ssl(server_name).then((message) => console.log(message));
      } else if (ssl_install === "n") {
        console.log("Skipping SSL Install");
      }

      //Restart NGINX
      restart_nginx().then((message) => console.log(message));
      return resolve();

    });

  });
}

/** 
 * 
 * Static VirtualHost 
 * 
 */
staticVH() = (options) => {

  return new Promise((resolve, reject) => {
    let root_dir = options.root_dir;
    let server_name = options.server_name;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    server_name ${server_name};\n    root ${root_dir};\n    index index.php index.html index.htm index.nginx-debian.html;\n\n    location \/ {\n        \n        try_files \\$uri \\$uri\/ \/index.html;\n        autoindex on;\n        autoindex_exact_size off;\n        autoindex_localtime on;\n\n    }\n\n    # Hide hidden stuff (starts with .)\n    location ~ .*\/\\. {\n           return 403;\n    }\n}`;

    fs.writeFile(`/etc/nginx/sites-available/${server_name}`, data, {
      flag: 'w+'
    }, function(err) {
      console.log("NGINX File Created");
      if (err) {
        return reject(Error(err));
      }

      symlink(server_name).then((message) => console.log(message));

      //SSL
      if (ssl_install === "y") {
        install_ssl(server_name).then((message) => console.log(message));
      } else if (ssl_install === "n") {
        console.log("Skipping SSL Install");
      }

      //Restart NGINX
      restart_nginx().then((message) => console.log(message));
      return resolve();
    });

  });

}

/** 
 * 
 * Redirect VirtualHost 
 * 
 */
redirect() = (options) => {

  return new Promise((reject, resolve) => {
    let server_name = options.server_name;
    let redirect_link = options.redirect_link;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    server_name ${server_name};\n    rewrite ^\/(.*)$ ${redirect_link} permanent;\n}`;

    fs.writeFile(`/etc/nginx/sites-available/${server_name}`, data, {
      flag: 'w+'
    }, function(err) {
      console.log("NGINX File Created");
      if (err) {
        return reject(Error(err));
      }

      symlink(server_name).then((message) => console.log(message));

      //SSL
      if (ssl_install === "y") {
        install_ssl(server_name).then((message) => console.log(message));
      } else if (ssl_install === "n") {
        console.log("Skipping SSL Install");
      }

      //Restart NGINX
      restart_nginx().then((message) => console.log(message));
      return resolve();

    });

  });

}

/** 
 * 
 * Remove VirtualHost 
 * 
 */
remove() = (options) => {
  return new Promise((reject, resolve) => {
    let file_name = options.file_name;
    let server_name = options.server_name;

    console.log("Removing virtual hosts");
    exec(`rm /etc/nginx/sites-available/${file_name}`, (err, stdout, stderr) => {
      if (err) {
        reject(Error(`${err.message}`));
        return;
      }
      if (stderr) {
        reject(Error(`${stderr}`));
        return;
      }
      exec(`rm /etc/nginx/sites-enabled/${file_name}`, (err, stdout, stderr) => {
        if (err) {
          reject(Error(`${err.message}`));
          return;
        }
        if (stderr) {
          reject(Error(`${stderr}`));
          return;
        }
      });
    });

    console.log("Removing any certificates");
    exec(`sudo certbot delete --cert-name ${server_name}`, (err, stdout, stderr) => {
      if (err) {
        reject(Error(`${err.message}`));
        return;
      }
      if (stderr) {
        reject(Error(`${stderr}`));
        return;
      }
    });

    //Restart NGINX
    restart_nginx().then((message) => console.log(message));
    return resolve();

  })
}


  }
}

module.exports = {
  ubuntuOS
}