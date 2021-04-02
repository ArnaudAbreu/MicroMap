# Getting Started with MicroMap

This project is about viewing and annotating digital pathology slides. At the moment, it only relies on the [openslide python API](https://openslide.org/) for the slide serving and the coordinates system.

## Install and run instructions

### Edit env file

In the `.env` file, change the `SLIDES` and `ANNOTS` variables to point to your slide and annotation folders.
Change the `REACT_APP_PORT` and `REACT_APP_FLASK_SERVER_PORT` to available ports (they need to be different).

**Untested**: Change the `REACT_APP_FLASK_SERVER_IP` to the ip the server is running on.
Anything else than `0.0.0.0` (local access) is untested and may not work as intended.
If the server is running remotely, putting the ip address of the remote server should work.

### Run the dockers

Make sure you have [docker](https://docs.docker.com/get-docker/) and [docker-compose](https://docs.docker.com/compose/install/) installed. 

From the main directory (`MicroMap`), run `docker-compose up`. The app and server should build and start.


### Connect to the app

On your web browser, connect to `http://APP_IP:REACT_APP_PORT/` where `APP_IP` is the ip of the machine app is running on. `REACT_APP_PORT` is the same as defined in the `.env` file.
