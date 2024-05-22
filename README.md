# 3Dify
Automatic avatar generator from 2D image

[LIVE DEMO](http://isislab.it:30000/3DifyAlpha1)

# Running the server

## With the provided Dockerfile
The repository offers a Dockerfile that you can use to run the project in a dockerized environment.
Build the image with the following command:

```bash
docker build -t 3dify:latest .
```

You can now proceed with the creation of the container with the following command:

```bash
docker run -p 3000:3000 3dify:latest
```

The web server will be ready to accept requests on port 3000: http://localhost:3000/

## Local installation
Execute the following commands to install the required dependencies and start a local web server listening on port 3000.

``` bash
cd 3Dify\makeHuman_Exporter\public_html
npm i
npm start
```

The server is up at http://localhost:3000/.
