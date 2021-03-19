#!/usr/bin/env node

/**
 * 
 * Const's
 * 
 */
//External Packages
const chalk = require("chalk");
//Readline
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
//Get arguments
// let args = process.argv.splice(2);
//Main Function File
let nginx = require("./nginx");

/** 
 * 
 * Install Choice
 * Choices: Standard, Reverse Proxy, PHP, Static, Redirect, Remove
 * 
 */
let options = {};
if (process.platform != "linux") {
  console.log("This NPM package only currently supports Linux systems at the moment.")
  return readline.close();
}
readline.question(`Please select an installation type: \n[1] Standard VirtualHost \n[2] Basic Reverse Proxy \n[3] Basic PHP VirtualHost \n[4] Static VirtualHost \n[5] Redirect Virtual Host \n[6] Remove Virtual Host \nChoice: `, (choice) => {
  options.choice = choice;

  switch (choice) {
    case "1":
      readline.question(`Enter root directory (/var/www/html): `, (root_dir) => {
        if (!root_dir) {
          console.log("No root directory provided, cancelling");
          return readline.close()
        }
        options.root_dir = root_dir;
        readline.question(`Enter server_name (test.benwhybrow.com): `, (server_name) => {
          if (!server_name) {
            console.log("No server name provided, cancelling");
            return readline.close()
          }
          options.server_name = server_name;
          readline.question(`Would you like SSL installed? (y|n): `, (ssl_install) => {
            if (ssl_install.split("\n")[0] !== "y" && ssl_install.split("\n")[0] !== "n") {
              console.log("Incorrect value provided, cancelling");
              return readline.close()
            }
            options.ssl_install = ssl_install;
            nginx.standard(options).then((result) => {
              console.log("VirtualHost Installation Complete!")
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
              nginx.reverse(options);
            })
          })
        })
      })
      break;

    case "3":
      readline.question(`Enter root directory (/var/www/html): `, (root_dir) => {
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
            nginx.php(options);
          })
        })
      })
      break;

    case "4":
      readline.question(`Enter root directory (/var/www/html): `, (root_dir) => {
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
          nginx.static(options);
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
          nginx.redirect(options);
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
          nginx.remove(options);
        })
      })
      break;

    default:
      console.log("Invalid option choice");
      readline.close();
      break;
  }
})