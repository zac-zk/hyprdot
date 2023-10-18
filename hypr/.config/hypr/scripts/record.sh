#!/bin/bash

wf-recorder -g "$(slurp)" -f `date '+%Y_%m_%d_%H_%M_%S'`'.mp4'
