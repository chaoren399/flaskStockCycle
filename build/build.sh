#!/bin/bash
echo "开始安装..."
rm -rf flaskStockCycle
git clone https://gitee.com/wang-huamao/flaskStockCycle.git

cd flaskStockCycle



docker rmi stock:v1.0 -f
docker build -t stock:v1.0 -f Dockerfile . --progress=plain --no-cache

docker rm -f stock
docker run -d --name=stock  -p 5001:5000  stock:v1.0