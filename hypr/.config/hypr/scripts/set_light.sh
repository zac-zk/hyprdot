#! /bin/bash

case $1 in
    up) brightnessctl s +10% ;;
    down) brightnessctl s 10%- ;;
esac
