//Global Variables
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const fs = require("fs");
const { exec } = require("child_process");

/** 
 * 
 * Install Choice
 * Choices: Standard, Reverse Proxy, PHP, Static, Redirect, Remove
 * 
 */
class windowsOS {
  constructor() {

    this.options = {};

    //Check whether the script has been ran in admin
    let isElevated;
    try {
      child_process.execFileSync( "net", ["session"], { "stdio": "ignore" } );
      isElevated = true;
    } catch(e) {
      isElevated = false;
    }

    //Asking the Questions
    readline.question("Please define your NGINX installation directory:", (directory) => {
      let directory = directory;

      readline.question(`Please select an installation type: \n[1] Standard VirtualHost \n[2] Basic Reverse Proxy \n[3] Basic PHP VirtualHost \n[4] Static VirtualHost \n[5] Redirect Virtual Host \n[6] Remove Virtual Host \nChoice: `, (choice) => {
        options.choice = choice;
      
        switch (choice) {
          case "1":
            readline.question(`Enter root directory (C:/web/html): `, (root_dir) => {
              if (!root_dir) {
                console.log("No root directory provided, cancelling");
                return readline.close();
              }
              options.root_dir = root_dir;
              readline.question(`Enter server_name (test.benwhybrow.com): `, (server_name) => {
                if (!server_name) {
                  console.log("No server name provided, cancelling");
                  return readline.close();
                }
                options.server_name = server_name;
                readline.question(`Would you like SSL installed? (y|n): `, (ssl_install) => {
                  if (ssl_install.split("\n")[0] !== "y" && ssl_install.split("\n")[0] !== "n") {
                    console.log("Incorrect value provided, cancelling");
                    return readline.close();
                  }
      
                  options.ssl_install = ssl_install;
                  nginx.standard(options).then((result) => {
                    // console.log(result)
                    readline.close();
                    console.log("VirtualHost Installation Complete!");
                  })
                })
              })
            })
            break;
      
          case "2":
            readline.question(`Enter server_name (test.benwhybrow.com): `, (server_name) => {
              if (!server_name) {
                console.log("No server name provided, cancelling");
                return readline.close();
              }
              options.server_name = server_name;
              readline.question(`Enter source host (localhost): `, (source_host) => {
                if (!source_host) {
                  console.log("No source host provided, cancelling");
                  return readline.close();
                }
                options.source_host = source_host;
                readline.question(`Enter source port (3001): `, (source_port) => {
                  if (!source_port) {
                    console.log("No source port provided, cancelling");
                    return readline.close();
                  }
                  options.source_port = source_port;
                  readline.question(`Is the source using http or https? (http|https): `, (source_ssl) => {
                    if (!source_ssl) {
                      console.log("No source SSL provided, cancelling");
                      return readline.close();
                    }
                    options.source_ssl = source_ssl;
                    readline.question(`Would you like SSL installed? (y|n): `, (ssl_install) => {
                      if (ssl_install.split("\n")[0] !== "y" && ssl_install.split("\n")[0] !== "n") {
                        console.log("Incorrect value provided, cancelling");
                        return readline.close();
                      }
      
                      options.ssl_install = ssl_install;
                      nginx.reverse(options).then((result) => {
                        console.log("VirtualHost Installation Complete!");
                        return readline.close();
                      })
                    })
                  })
                })
              })
            })
            break;
      
          case "3":
            readline.question(`Enter root directory (C:/web/html): `, (root_dir) => {
              if (!root_dir) {
                console.log("No root directory provided, cancelling");
                return readline.close();
              }
              options.root_dir = root_dir;
              readline.question(`Enter server_name (test.benwhybrow.com): `, (server_name) => {
                if (!server_name) {
                  console.log("No server name provided, cancelling");
                  return readline.close();
                }
                options.server_name = server_name;
                readline.question(`Enter your php-fpm version (7.2): `, (php_version) => {
                  if (!php_version) {
                    console.log("No PHP version provided, cancelling");
                    return readline.close();
                  }
                  options.php_version = php_version;
                  readline.question(`Would you like SSL installed? (y|n): `, (ssl_install) => {
                    if (ssl_install.split("\n")[0] !== "y" && ssl_install.split("\n")[0] !== "n") {
                      console.log("Incorrect value provided, cancelling");
                      return readline.close();
                    }
      
                    options.ssl_install = ssl_install;
                    nginx.php(options).then((result) => {
                      console.log("VirtualHost Installation Complete!");
                      return readline.close();
                    })
                  })
                })
              })
            })
            break;
      
          case "4":
            readline.question(`Enter root directory (C:/web/html): `, (root_dir) => {
              if (!root_dir) {
                console.log("No root directory provided, cancelling");
                return readline.close();
              }
              options.root_dir = root_dir;
              readline.question(`Enter server_name (test.benwhybrow.com): `, (server_name) => {
                if (!server_name) {
                  console.log("No server name provided, cancelling");
                  return readline.close();
                }
                options.server_name = server_name;
                readline.question(`Would you like SSL installed? (y|n): `, (ssl_install) => {
                  if (ssl_install.split("\n")[0] !== "y" && ssl_install.split("\n")[0] !== "n") {
                    console.log("Incorrect value provided, cancelling");
                    return readline.close();
                  }
      
                  options.ssl_install = ssl_install;
                  nginx.static(options).then((result) => {
                    console.log("VirtualHost Installation Complete!");
                    return readline.close();
                  })
                })
              })
            })
            break;
      
          case "5":
            readline.question(`Enter server_name (test.benwhybrow.com): `, (server_name) => {
              if (!server_name) {
                console.log("No server name provided, cancelling");
                return readline.close();
              }
              options.server_name = server_name;
              readline.question(`Enter the link to redirect to (new.benwhybrow.com): `, (redirect_link) => {
                if (!redirect_link) {
                  console.log("No redirect link provided, cancelling");
                  return readline.close();
                }
                options.redirect_link = redirect_link;
                readline.question(`Would you like SSL installed? (y|n): `, (ssl_install) => {
                  if (ssl_install.split("\n")[0] !== "y" && ssl_install.split("\n")[0] !== "n") {
                    console.log("Incorrect value provided, cancelling");
                    return readline.close();
                  }
      
                  options.ssl_install = ssl_install;
                  nginx.redirect(options).then((result) => {
                    console.log("VirtualHost Installation Complete!");
                    return readline.close();
                  })
                })
              })
            })
            break;
      
          case "6":
            readline.question(`Enter the config file name (test.benwhybrow.com): `, (file_name) => {
              if (!file_name) {
                console.log("No file name provided, cancelling");
                return readline.close();
              }
              options.file_name = file_name;
              readline.question(`Enter the server name (test.benwhybrow.com): `, (server_name) => {
                if (!server_name) {
                  console.log("No server name provided, cancelling");
                  return readline.close();
                }
                options.server_name = server_name;
                nginx.remove(options).then((result) => {
                  console.log("VirtualHost Removal Complete!");
                  return readline.close();
                })
              })
            })
            break;
      
          default:
            console.log("Invalid option choice");
            readline.close();
            break;
        }
      })
    })

/**
 * 
 * SSL Install
 * 
 */
install_ssl() = (server_name) => {
  return new Promise((resolve, reject) => {
    //See if certbot is installed
    exec("certbot --version", (err, stdout, stderr) => {
      if (err) {
        console.log("Certbot is not installed. Please install certbot and try again.");
        console.log("Install Certbot: https://dl.eff.org/certbot-beta-installer-win32.exe");
        return console.log("Exiting...");
      }
    });

    //Install SSL
    exec(`certbot --nginx -d ${server_name}`, (err, stdout, stderr) => {
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

    fs.writeFile(`${directory}/conf/sites/${server_name}`, data, {
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
reverse() = async (options) => {
  return new Promise((resolve, reject) => {
    let server_name = options.server_name;
    let source_host = options.source_host;
    let source_port = options.source_port;
    let source_ssl = options.source_ssl;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    server_name ${server_name};\n\n    location \/ {\n        proxy_pass ${source_ssl}:\/\/${source_host}:${source_port};\n\n    }\n}`;

    fs.writeFile(`${directory}/conf/sites/${server_name}`, data, {
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
php() = (options) => {
  return new Promise((resolve, reject) => {
    let root_dir = options.root_dir;
    let server_name = options.server_name;
    let php_version = options.php_version;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    root ${root_dir};\n    index index.php index.html index.htm index.nginx-debian.html;\n    server_name ${server_name};\n\n    location \/ {\n        try_files $uri $uri\/ =404;\n    }\n\n    location ~* \\.php$ {\n            fastcgi_pass                    unix:\/var\/run\/php\/php${php_version}-fpm.sock;\n            fastcgi_index                   index.php;\n            fastcgi_split_path_info         ^(.+\\.php)(.*)$;\n            include                         fastcgi_params;\n            fastcgi_param PATH_INFO         \\$fastcgi_path_info;\n            fastcgi_param SCRIPT_FILENAME   \\$document_root\\$fastcgi_script_name;\n    }\n\n}`;

    fs.writeFile(`${directory}/conf/sites/${server_name}`, data, {
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
static() = (options) => {

  return new Promise((resolve, reject) => {
    let root_dir = options.root_dir;
    let server_name = options.server_name;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    server_name ${server_name};\n    root ${root_dir};\n    index index.php index.html index.htm index.nginx-debian.html;\n\n    location \/ {\n        \n        try_files \\$uri \\$uri\/ \/index.html;\n        autoindex on;\n        autoindex_exact_size off;\n        autoindex_localtime on;\n\n    }\n\n    # Hide hidden stuff (starts with .)\n    location ~ .*\/\\. {\n           return 403;\n    }\n}`;

    fs.writeFile(`${directory}/conf/sites/${server_name}`, data, {
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
redirect() = (options) => {

  return new Promise((reject, resolve) => {
    let server_name = options.server_name;
    let redirect_link = options.redirect_link;
    let ssl_install = options.ssl_install;

    let data = `server {\n    listen 80;\n    listen [::]:80;\n\n    server_name ${server_name};\n    rewrite ^\/(.*)$ ${redirect_link} permanent;\n}`;

    fs.writeFile(`${directory}/conf/sites/${server_name}`, data, {
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
remove() = (options) => {
  return new Promise((reject, resolve) => {
    let file_name = options.file_name;
    let server_name = options.server_name;

    console.log("Removing virtual hosts");
    exec(`rm ${directory}/conf/sites/${file_name}`, (err, stdout, stderr) => {
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