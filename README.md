# l3pui

## Development
```
docker-compose -f docker/docker-compose.dev.yml up
```
Note: all node packages are installed during the image building process. If there is any change to package.json the image has to be rebuilt using the previous command followed by `--build`

## Deploy
The l3pilot/ui:deploy image contains a nginx server without SSL configured on por 10080 (which is only exposed to other containers), the configuration file is in `docker/app.conf`.
We used [docker-letsencrypt](https://github.com/linuxserver/docker-letsencrypt) to automate the SSL certificate generation. The image contains another nginx instance, which we configure as a proxy to our internal nginx (on port 10080). Note that the configuration for this later nginx is in `docker/config/letsencrypt/nginx/site-confs/default`
Note that the domain name and is configurable in `docker/docker-compose.dep.yml`. Also note that the certificates are updated automatically with a cronjob inside the letsencrypt container.

Deployment is executed with
```
docker-compose -f docker/docker-compose.dep.yml up -d
```

Please note that we also support to run the deployment version without the HTTPS support, in the case you want an optimised version to run locally on your private network.
It uses the same docker deploy image and can be executed with
```
docker-compose -f docker/docker-compose.dep.nohttps.yml up -d
```

To force a rebuilt of the images, add `--build` to the above command.

## API URL
It is possible to configure the CDB API URL using the `VUE_APP_API_URL` environment variable in each `docker-compose.yml` file corresponding to the Development/Deploy modes.
This allows to change the CDB API at runtime without needing to rebuild the images.
The full consortium API is available on `https://apil3p.atmosphere.tools/v1`, however one can connect to a local API using `http://localhost:<API PORT>`, assuming that the API is configured locally at `<API PORT>`
