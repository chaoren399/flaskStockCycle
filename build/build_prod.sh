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
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
    # set -a 让后续所有赋值自动 export；比 export $(cat ... | xargs) 安全
    # （后者会被注释行、含空格/引号的值、CRLF 换行搞崩，报 "#: not a valid identifier"）
    set -a
    # tr -d '\r' 兼容 Windows 下编辑产生的 CRLF：否则 PASSWORD 尾部会带上 \r，docker login 会认证失败
    # shellcheck disable=SC1090
    . <(tr -d '\r' < "$ENV_FILE")
    set +a
else
    echo "错误: $ENV_FILE 文件不存在"
    exit 1
fi

# 校验必需变量，避免 docker login 用空账号密码静默失败
if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
    echo "错误: .env 中的 USERNAME / PASSWORD 未设置"
    exit 1
fi

# 设置变量
IMAGE_NAME="bmds"
IMAGE_TAG="qingxuzhouqi-v4.5"
DOCKERFILE_PATH="./Dockerfile_prod"
BUILD_CONTEXT="./"

# 构建 Docker 镜像（--network=host 让构建容器复用宿主机网络，避开容器内 DNS/SSL 不通）
docker build -t $IMAGE_NAME:$IMAGE_TAG -f $DOCKERFILE_PATH $BUILD_CONTEXT --no-cache --network=host

# 推送镜像到镜像仓库（可选）
registry_url="registry.cn-hangzhou.aliyuncs.com"
docker login $registry_url -u $USERNAME -p $PASSWORD

docker tag $IMAGE_NAME:$IMAGE_TAG registry.cn-hangzhou.aliyuncs.com/baimeidashu/$IMAGE_NAME:$IMAGE_TAG
docker push registry.cn-hangzhou.aliyuncs.com/baimeidashu/$IMAGE_NAME:$IMAGE_TAG

# 输出构建完成信息
echo "registry.cn-hangzhou.aliyuncs.com/baimeidashu/$IMAGE_NAME:$IMAGE_TAG   built successfully."
