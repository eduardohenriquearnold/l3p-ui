# l3pui

## Development
```
docker-compose -f docker-compose.dev.yml up
```
Note: all node packages are installed during the image building process. If there is any change to package.json the image has to be rebuilt using the previous command followed by `--build`

## Deploy
Build the docker image with 
```
docker build -f Dockerfile.deploy -t l3pilot/ui:deploy .
```

Additional NGINX settings are modified in the `app.conf` file. (Needs rebuilding after each change).

Run the deployment with
```
docker run -it --rm -p 80:80 l3pilot/ui:deploy
```

