#!/bin/bash

# TODO: could perhaps shrink the final image by using a separate image for building and a separate image for deploying
# without the toolchain dependencies

docker login
docker build . -t sonos-tannoy:latest -f Dockerfile.rpi
docker tag sonos-tannoy larsim/sonos-tannoy:latest
docker push larsim/sonos-tannoy:latest
