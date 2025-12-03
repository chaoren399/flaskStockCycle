#!/bin/bash

# 设置变量
SOURCE_FILE="data.csv"
BACKUP_DIR="./bak"
DATE_FORMAT=$(date +"%Y%m%d_%H%M%S")

# 创建备份目录（如果不存在）
mkdir -p "$BACKUP_DIR"

# 检查源文件是否存在
if [ -f "$SOURCE_FILE" ]; then
    # 创建带时间戳的备份文件
    cp "$SOURCE_FILE" "$BACKUP_DIR/${SOURCE_FILE%.*}_$DATE_FORMAT.${SOURCE_FILE##*.}"
    echo "[$(date)] 备份成功: $SOURCE_FILE -> $BACKUP_DIR/${SOURCE_FILE%.*}_$DATE_FORMAT.${SOURCE_FILE##*.}"
else
    echo "[$(date)] 错误: 源文件 $SOURCE_FILE 不存在"
fi
