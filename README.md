# Getting Started with MicroMap

This project is about viewing and annotating digital pathology slides. At the moment, it only relies on the [openslide python API](https://openslide.org/) for the slide serving and the coordinates system.

## Install and run instructions

### Backend Slide Server

In `servers/wsi_config.yml`,\
Set the root directory containing your WSI files.\
Set the ip of the slide server (`127.0.0.1` for localhost).\
Set the port of the slide server.

### Backend Annotation Server

In `servers/annot_config.yml`,\
Set the root directory where to store annotation files.\
Set the ip of the slide server (`127.0.0.1` for localhost).\
Set the port of the slide server.

> :warning: **Setting ports**: Be very careful Slide server and Annotation server must run on different ports!

### Frontend App Server

First, make sure you have node installed (here is the command for a system with yum package manager):
```bash
yum install nodejs
```

Second, install `serve` node package with:
```bash
npm install -g serve
```

Make sure the `app/.env` urls matches the ip set in the backend servers.\
`cd` to the `app` folder, and run the following commands:
``` bash
npm install
npm run build
serve -s build -l {port}
```

> :warning: **Setting port**: Ensure port is different from ports you set previously...
