# 42lyon_matrix
42lyon_matrix is a web project that uses [42's API](https://api.intra.42.fr/apidoc) to list and show the location of online users inside the [42lyon](https://42lyon.fr) clusters.

This is a fork of [Sylvain Lopez's 42matrice](https://gitlab.com/Sylrelo/42matrice), it's goal is to improve the responsive UI and refactor the code.

## Dependencies

```
nodejs >= 14
yarn
pm2
nginx
```

## Use the right configuration file :

```bash
cp config.[REALM].json config.json
```

## Starting the back-end :
```
yarn install
pm2 start app.js
pm2 save //to enable auto-start
```

## Building the front-end :
```
yarn install
yarn build
```

## nginx example configuration file :

```
server {

    server_name 42.slopez.dev;
	root /var/www/42matrice/client/public;
	index index.html;

	server_name _;
	location / {
			try_files $uri $uri/ =404;
	}

	location /socket.io/ {
		proxy_pass http://127.0.0.1:5666;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection 'upgrade';
		proxy_set_header Host $host;
		proxy_cache_bypass $http_upgrade;
	}
}
```
