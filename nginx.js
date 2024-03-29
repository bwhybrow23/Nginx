//External Packages
const chalk = require("chalk");
const fs = require("fs");
const {
  exec
} = require("child_process");

/**
 * 
 * Create symlink
 * 
 */
const symlink = (server_name) => {
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
const install_ssl = (server_name) => {
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
const restart_nginx = () => {
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
const standard = async (options) => {
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
const reverse = async (options) => {
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
const php = (options) => {
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
const static = (options) => {

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
const redirect = (options) => {

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
const remove = (options) => {
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

module.exports = {
  standard,
  reverse,
  php,
  static,
  redirect,
  remove
};