#!/bin/bash

sync() {
    cd /home/zuok/hyprdots
    git add .
    git commit -m "timely commit"
    git push -u origin

    date >> ./scripts/github_sync.log
}

folder_path="/home/zuok/hyprdots"

last_modified_time=$(stat -c %Y "$folder_path")
current_time=$(date +%s)
threshold=`expr 60 \* 60 \* 24`

time_diff=$((current_time - last_modified_time))

if [ "$time_diff" -le "$threshold" ];then
    sync
fi

