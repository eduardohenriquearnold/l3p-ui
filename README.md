L3 Pilot Data Visualisation
===========================

This repository consists of a web interface for L3Pilot data visualisation. It is the front-end for the DB developed within SP5.

### Build
```
docker build -t l3pilot/ui .
```

### Deploy
```
docker run -it -p 8080:8080 --rm l3pilot/ui
```

