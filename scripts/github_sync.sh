#!/bin/bash
#

cd /home/zuok/hyprdots
git add .
git commit -m "timely commit"
git push -u origin

date >> ./scripts/github_sync.log