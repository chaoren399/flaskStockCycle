#!/bin/bash
echo "开始安装..."
rm -rf flaskStockCycle
git clone https://gitee.com/wang-huamao/flaskStockCycle.git

cd flaskStockCycle

# 确保 Dockerfile 存在
if [ ! -f Dockerfile ]; then
    echo "错误: Dockerfile 不存在"
    exit 1
fi


#
#docker rmi stock:v1.0 -f
#docker build -t stock:v1.0 -f Dockerfile . --progress=plain --no-cache
#
#docker rm -f stock
#docker run -d --name=stock  -p 5010:5000  stock:v1.0
#

docker-compose -f docker-compose-uat.yaml stop
# 首次部署或重新构建

docker-compose -f docker-compose-uat.yaml up -d --build

# 后续启动/停止
docker-compose -f docker-compose-uat.yaml start

