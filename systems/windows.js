//Global Variables
const fs = require("fs");
const { exec, execFileSync } = require("child_process");
const prompt = require('prompt');

/** 
 * 
 * Install Choice
 * Choices: Standard, Reverse Proxy, PHP, Static, Redirect, Remove
 * 
 */
class windowsOS {
  constructor() {

    //Prompt
    prompt.start();

    let options = {};

    //Check whether the script has been ran in admin
    let isElevated;
    try {
      execFileSync( "net", ["session"], { "stdio": "ignore" } );
      isElevated = true;
    } catch(e) {
      isElevated = false;
    }

    //If not admin, exit with error
    if (!isElevated) {
      return console.log("Please run this script as an administrator.");
    }

    //Get NGINX directory
    prompt.get([{
      name: "directory",  
      description: "Please define your NGINX installation directory (C:\nginx):",
      required: true, 
      default: "C:/nginx",
      type: "string"
    }], function (err, result) {

      //Error Handling
      if (err) {
        return console.log("Error: ", err);
      };

      //Directory Data Validation
      // If no directory provided, exit with error
      if (!result.directory) {
        console.log("No directory provided, exiting...");
        return prompt.stop();
      }
      // If directory doesn't exist, exit with error
      if (!fs.existsSync(result.directory)) {
        console.log("Directory doesn't exist, exiting...");
        return prompt.stop();
      }
      // If directory doesn't have nginx.exe, exit with error
      if (!fs.existsSync(`${result.directory}/nginx.exe`)) {
        console.log("NGINX not found in directory, please install it and try again. Exiting...");
        return prompt.stop();
      }

      //NGINX Directory
      options.directory = result.directory;

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
              description: "Enter root directory (C:/web/html):",
              required: true,
              default: "C:/web/html",
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
              description: "Enter root directory (C:/web/html):",
              required: true,
              default: "C:/web/html",
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
              description: "Enter root directory (C:/web/html):",
              required: true,
              default: "C:/web/html",
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

    });

    
/**
 * 
 * SSL Install
 * 
 */
function install_ssl(server_name) {
  return new Promise((resolve, reject) => {
    console.log("Installing SSL");

    //See if certbot is installed
    exec("certbot --version", (err, stdout, stderr) => {
      if (err) {
        console.log("Certbot is not installed. Please install certbot and try again.");
        console.log("Install Certbot: https://github.com/certbot/certbot/releases/latest/download/certbot-beta-installer-win_amd64_signed.exe");
        return console.log("Exiting...");
      }
    });

    //Stop NGNIX to install cert
    prompt.get([{
      name: "stop_nginx",
      description: "Would you like to stop NGINX to install SSL? (y|n):",
      required: true,
      type: "string",
      pattern: /^[y|n]+$/
    }], function (err, result) {

      //Error Handling
      if (err) {
        return console.log("Error: ", err);
      };

      if(result.stop_nginx === "y") {
        console.log("Stopping NGINX...");
        exec(`${options.directory}/nginx.exe -s stop`, (err, stdout, stderr) => {
          if (err) {
            console.log("NGINX is not running, skipping...");
          }
        });
      } else if (result.stop_nginx === "n") {
        return resolve("Skipping SSL Installation");
      };

      //Generate SSL certificate
      console.log("Attempting to install SSL certificate...");
      exec(`certbot certonly --standalone -d ${server_name}`, (err, stdout, stderr) => {
        if (err) {
          reject(Error(`${err.message}`));
          return;
        }
        if (stderr) {
          reject(Error(`${stderr}`));
          return;
        }
        console.log("SSL Certificate Generated");
      });

      //Add NGINX certificate to config file
      console.log("Adding SSL to NGINX config file");
      let serverConfigFilePath = path.join(options.directory, "conf", "sites", server_name);

      //Read existing config file
      fs.readFile(serverConfigFilePath, 'utf8', function(err, data) {
        if (err) {
          reject(Error(`${err.message}`));
          return;
        }

        //Modify config file to add SSL support
        const sslConfig = `
        listen 443 ssl;
        ssl_certificate C:\Certbot\live\\${server_name}\fullchain.pem;
        ssl_certificate_key C:\Certbot\live\\${server_name}\privkey.pem;
        `;

        //Insert the SSL config before the existing server block ends
        let modifiedServerConfig = data.replace(/server {/g, `server {\n${sslConfig}`);

        //Write the modified config file back
        fs.writeFile(serverConfigFilePath, modifiedServerConfig, 'utf8', function(err) {
          if (err) {
            reject(Error(`${err.message}`));
            return;
          }

          console.log("SSL has been added to the NGINX config file.");
        });
      });
    })
  })
}

/** 
 * 
 * Restart NGINX
 * 
 */
function restart_nginx() {
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
async function standard(options) {
  return new Promise((resolve, reject) => {
    let root_dir = options.root_dir;
    let server_name = options.server_name;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    root ${root_dir};\n    index index.php index.html index.htm index.nginx-debian.html;\n    server_name ${server_name};\n\n    location \/ {\n        try_files \\$uri \\$uri\/ =404;\n    }\n}`;

    fs.writeFile(`${options.directory}/conf/sites/${server_name}`, data, {
      flag: 'w+'
    }, function(err) {
      console.log("NGINX File Created");
      if (err) {
        return reject(Error(err));
      }

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
async function reverse(options) {
  return new Promise((resolve, reject) => {
    let server_name = options.server_name;
    let source_host = options.source_host;
    let source_port = options.source_port;
    let source_ssl = options.source_ssl;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    server_name ${server_name};\n\n    location \/ {\n        proxy_pass ${source_ssl}:\/\/${source_host}:${source_port};\n\n    }\n}`;

    fs.writeFile(`${options.directory}/conf/sites/${server_name}`, data, {
      flag: 'w+'
    }, function(err) {
      console.log("NGINX File Created");
      if (err) {
        return reject(Error(err));
      }

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
async function php(options) {
  return new Promise((resolve, reject) => {
    let root_dir = options.root_dir;
    let server_name = options.server_name;
    let php_version = options.php_version;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    root ${root_dir};\n    index index.php index.html index.htm index.nginx-debian.html;\n    server_name ${server_name};\n\n    location \/ {\n        try_files $uri $uri\/ =404;\n    }\n\n    location ~* \\.php$ {\n            fastcgi_pass                    unix:\/var\/run\/php\/php${php_version}-fpm.sock;\n            fastcgi_index                   index.php;\n            fastcgi_split_path_info         ^(.+\\.php)(.*)$;\n            include                         fastcgi_params;\n            fastcgi_param PATH_INFO         \\$fastcgi_path_info;\n            fastcgi_param SCRIPT_FILENAME   \\$document_root\\$fastcgi_script_name;\n    }\n\n}`;

    fs.writeFile(`${options.directory}/conf/sites/${server_name}`, data, {
      flag: 'w+'
    }, function(err) {
      console.log("NGINX File Created");
      if (err) {
        return reject(Error(err));
      }

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
async function staticVH(options) {

  return new Promise((resolve, reject) => {
    let root_dir = options.root_dir;
    let server_name = options.server_name;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    server_name ${server_name};\n    root ${root_dir};\n    index index.php index.html index.htm index.nginx-debian.html;\n\n    location \/ {\n        \n        try_files \\$uri \\$uri\/ \/index.html;\n        autoindex on;\n        autoindex_exact_size off;\n        autoindex_localtime on;\n\n    }\n\n    # Hide hidden stuff (starts with .)\n    location ~ .*\/\\. {\n           return 403;\n    }\n}`;

    fs.writeFile(`${options.directory}/conf/sites/${server_name}`, data, {
      flag: 'w+'
    }, function(err) {
      console.log("NGINX File Created");
      if (err) {
        return reject(Error(err));
      }

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
async function redirect(options) {

  return new Promise((reject, resolve) => {
    let server_name = options.server_name;
    let redirect_link = options.redirect_link;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    server_name ${server_name};\n    rewrite ^\/(.*)$ ${redirect_link} permanent;\n}`;

    fs.writeFile(`${options.directory}/conf/sites/${server_name}`, data, {
      flag: 'w+'
    }, function(err) {
      console.log("NGINX File Created");
      if (err) {
        return reject(Error(err));
      }

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
async function remove(options) {
  return new Promise((reject, resolve) => {
    let file_name = options.file_name;
    let server_name = options.server_name;

    console.log("Removing virtual hosts");
    exec(`rm ${options.directory}/conf/sites/${file_name}`, (err, stdout, stderr) => {
      if (err) {
        reject(Error(`${err.message}`));
        return;
      }
      if (stderr) {
        reject(Error(`${stderr}`));
        return;
      }
    });

    console.log("Removing any certificates");
    exec(`certbot delete --cert-name ${server_name}`, (err, stdout, stderr) => {
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
  windowsOS
}