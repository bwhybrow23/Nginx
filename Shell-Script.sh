output() { echo -e '\e[36m'$1'\e[0m'; }
error() { echo -e '\e[31m'$1'\e[0m'; }

pre() {
    output "NGINX Virtualhost Generator Script"
    output "- Currently Supports Ubuntu Systems"
    output "- Made by Ben Whybrow & Samb8104"
    output "----------------------------------"

    #Check root
    if [ "$EUID" -ne 0 ]; then
        error "Please run with root"
        exit 1
    fi
}

create_standard() {
    echo "
server {
    listen 80;
    listen [::]:80;

    root ${ROOT_DIR};
    index index.php index.html index.htm index.nginx-debian.html;
    server_name ${SERVER_NAME};

    location / {
        try_files \$uri \$uri/ =404;
    }
}" > "/etc/nginx/sites-available/${SERVER_NAME}"
}

create_proxy() {
    echo "
server {
    listen 80;
    listen [::]:80;

    server_name ${SERVER_NAME};

    location / {
        proxy_pass ${SOURCE_PROTO}://${SOURCE_HOST}:${SOURCE_PORT};

    }
}" > "/etc/nginx/sites-available/${SERVER_NAME}"
}

create_php() {
    echo "
server {
    listen 80;
    listen [::]:80;

    root ${ROOT_DIR};
    index index.php index.html index.htm index.nginx-debian.html;
    server_name ${SERVER_NAME};

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.php$ {
            fastcgi_pass                    unix:/var/run/php/php${PHP_VERSION}-fpm.sock;
            fastcgi_index                   index.php;
            fastcgi_split_path_info         ^(.+\.php)(.*)$;
            include                         fastcgi_params;
            fastcgi_param PATH_INFO         \$fastcgi_path_info;
            fastcgi_param SCRIPT_FILENAME   \$document_root\$fastcgi_script_name;
    }

}" > "/etc/nginx/sites-available/${SERVER_NAME}"
}

create_static() {
    echo "
server {
    listen 80;
    listen [::]:80;

    server_name ${SERVER_NAME};
    root ${ROOT_DIR};
    index index.php index.html index.htm index.nginx-debian.html;

    location / {
        
        try_files \$uri \$uri/ /index.html;
        autoindex on;
        autoindex_exact_size off;
        autoindex_localtime on;

    }

    # Hide hidden stuff (starts with .)
    location ~ .*/\. {
           return 403;
    }
}" > "/etc/nginx/sites-available/${SERVER_NAME}"
}

create_redirect() {
    echo "
server {
    listen 80;
    listen [::]:80;

    server_name ${SERVER_NAME};
    rewrite ^/(.*)$ ${REDIRECT_DOMAIN} permanent;
}" > "/etc/nginx/sites-available/${SERVER_NAME}"
}

install_options() {
    output "Please select an installation type:
    \n[1] Standard VirtualHost
    \n[2] Basic Reverse Proxy
    \n[3] Basic PHP VirtualHost
    \n[4] Static VirtualHost
    \n[5] Redirect Virtual Host
    \n[6] Remove Virtual Host"
}

get_root_dir() {
    output "Enter root directory (/var/www/html):"
    read ROOT_DIR
}

get_server_name() {
    output "Enter server_name (website.example.com):"
    read SERVER_NAME
}

create_system_link() {
    sudo ln -s /etc/nginx/sites-available/$SERVER_NAME /etc/nginx/sites-enabled/
    output "Created system link"
}

check_ssl() {
    output "Would you like to install SSL with letsencrypt? (y,n):"
    read SSL_CHOICE
}

install_ssl() {
    case $SSL_CHOICE in
        y)
            output "Installing SSL..."
            sudo certbot --nginx -d $SERVER_NAME
            ;;
        n)
            output "Not installing SSL"
            ;;
        *)
            error "Invalid choice"
            exit 1
            ;;
    esac
}

get_reverse_info() {
    #Host
    output "Enter source host (localhost):"
    read SOURCE_HOST
    #Port
    output "Enter source port (3000):"
    read SOURCE_PORT
    #Is source using http or https
    output "Is the source using http or https? (http|https):"
    read SOURCE_PROTO
}

restart_nginx() {
    systemctl restart nginx
    output "NGINX restarted"
}

get_php_version() {
    output "Enter your php-fpm version (7.2):"
    read PHP_VERSION
}

get_redirect_domain() {
    output "Enter the link to redirect to (new.example.com):"
    read REDIRECT_DOMAIN
}

#Run
pre
install_options
read INSTALL_CHOICE
case $INSTALL_CHOICE in
    1)  
        output "STANDARD VIRTUALHOST INSTALLATION"
        get_root_dir
        get_server_name
        create_standard
        create_system_link
        check_ssl
        install_ssl
        restart_nginx
        ;;
    2)
        output "REVERSE PROXY VIRTUALHOST INSTALLATION"
        get_server_name
        get_reverse_info
        create_proxy
        create_system_link
        check_ssl
        install_ssl
        restart_nginx
        ;;
    3) 
        output "BASIC PHP VIRTUALHOST INSTALLATION"
        get_server_name
        get_root_dir
        get_php_version
        create_php
        create_system_link
        check_ssl
        install_ssl
        restart_nginx
        ;;
    4)
        output "STATIC VIRTUALHOST INSTALLATION"
        get_server_name
        get_root_dir
        create_static
        create_system_link
        check_ssl
        install_ssl
        restart_nginx
        ;;
    5)
        output "REDIRECT VIRTUALHOST INSTALLATION"
        get_server_name
        get_redirect_domain
        create_redirect
        create_system_link
        check_ssl
        install_ssl
        restart_nginx
        ;;
    6)
        output "REMOVE VIRTUALHOST"
        output "Enter the config file name (website.example.com):"
        read FILE_NAME
        output "Enter the server name (website.example.com):"
        read SERVER_NAME
        output "Removing virtualhosts"
        rm /etc/nginx/sites-available/$FILE_NAME
        rm /etc/nginx/sites-enabled/$FILE_NAME
        output "Removing any certificates"
        sudo certbot delete --cert-name $SERVER_NAME
        restart_nginx
        ;;
    *)
        error "Invalid install choice"
        ;;
esac