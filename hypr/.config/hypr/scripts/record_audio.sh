#!/bin/bash

wf-recorder -g "$(slurp)" --audio -f `date '+%Y_%m_%d_%H_%M_%S'`'.mp4'
