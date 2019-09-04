# l3pui

## Development
```
docker-compose -f docker/docker-compose.dev.yml up
```
Note: all node packages are installed during the image building process. If there is any change to package.json the image has to be rebuilt using the previous command followed by `--build`

## Deploy
The l3pilot/ui:deploy image contains a nginx server without SSL configured on por 10080 (which is only exposed to other containers), the configuration file is in `docker/app.conf`.
We used ![docker-letsencrypt](https://github.com/linuxserver/docker-letsencrypt) to automate the SSL certificate generation. The image contains another nginx instance, which we configure as a proxy to our internal nginx (on port 10080). Note that the configuration for this later nginx is in `docker/config/letsencrypt/nginx/site-confs/default`
Note that the domain name and is configurable in `docker/docker-compose.dep.yml`. Also note that the certificates are updated automatically with a cronjob inside the letsencrypt container.

Deployment is executed with
```
docker-compose -f docker/docker-compose.dep.yml up -d
```
To force a rebuilt of the images, add `--build` to the above command.
