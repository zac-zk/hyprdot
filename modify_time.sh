
#!/bin/bash

# 设置要检查的文件夹路径
folder_path="/home/zuok/hyprdots/"

# 获取文件夹的最后修改时间
last_modified=$(stat -c %Y "$folder_path")

# 获取当前时间
current_time=$(date +%s)

# 设置阈值，例如 3600 秒（1 小时）
threshold=3600

# 计算时间差
time_diff=$((current_time - last_modified))

# 判断文件夹是否在阈值内被修改
if [ "$time_diff" -ge "$threshold" ]; then
    echo "文件夹未被修改"
else
    echo "文件夹已被修改"
fi
