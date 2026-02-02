#!/bin/bash
echo "开始安装..."
rm -rf flaskStockCycle
#git clone https://gitee.com/wang-huamao/flaskStockCycle.git
git clone https://github.com/chaoren399/flaskStockCycle.git

cd flaskStockCycle

# 确保 Dockerfile 存在
if [ ! -f Dockerfile_prod ]; then
    echo "错误: Dockerfile_prod 不存在"
    exit 1
fi
pwd
echo "加载环境变量..."
# 加载环境变量  .env 跟 build_prod.sh 同级
if [ -f ../.env ]; then
    export $(cat ../.env | xargs)
else
    echo "错误: .env 文件不存在"
    exit 1
fi

# 设置变量
IMAGE_NAME="bmds"
IMAGE_TAG="qingxuzhouqi-v4.5"
DOCKERFILE_PATH="./Dockerfile_prod"
BUILD_CONTEXT="./"

# 构建 Docker 镜像
docker build -t $IMAGE_NAME:$IMAGE_TAG -f $DOCKERFILE_PATH $BUILD_CONTEXT   --no-cache

# 推送镜像到镜像仓库（可选）
registry_url="registry.cn-hangzhou.aliyuncs.com"
docker login $registry_url -u $USERNAME -p $PASSWORD

docker tag $IMAGE_NAME:$IMAGE_TAG registry.cn-hangzhou.aliyuncs.com/baimeidashu/$IMAGE_NAME:$IMAGE_TAG
docker push registry.cn-hangzhou.aliyuncs.com/baimeidashu/$IMAGE_NAME:$IMAGE_TAG

# 输出构建完成信息
echo "registry.cn-hangzhou.aliyuncs.com/baimeidashu/$IMAGE_NAME:$IMAGE_TAG   built successfully."
