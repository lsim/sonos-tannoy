#!/bin/bash

docker run --privileged --net=host -v /dev/bus/usb:/dev/bus/usb -it --entrypoint /bin/sh  sonos-tannoy:Dockerfile