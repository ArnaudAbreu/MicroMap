FROM python:3.8

WORKDIR /usr/local/src
ARG OPENSLIDE_VERSION=3.4.1
ARG OPENSLIDE_URL=https://github.com/openslide/openslide/releases/download

COPY openslide-init.patch /usr/local/src
RUN wget ${OPENSLIDE_URL}/v${OPENSLIDE_VERSION}/openslide-${OPENSLIDE_VERSION}.tar.gz \
	&& tar xf openslide-${OPENSLIDE_VERSION}.tar.gz \
	&& patch -p0 <openslide-init.patch \
    && cd openslide-${OPENSLIDE_VERSION} \
	&& ./configure \
	&& make \
	&& make install

RUN mkdir /server
WORKDIR /server
COPY requirements.txt requirements.txt
RUN pip install -U pip
RUN pip install -r requirements.txt
COPY . .

RUN mkdir /data && mkdir /data/slides && mkdir /data/annots
