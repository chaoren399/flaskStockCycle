#!/bin/bash
echo "开始构建 Python 基础镜像..."

# 脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 自动定位 Dockerfile_python_base：优先同级目录，其次上一级目录
if [ -f "$SCRIPT_DIR/Dockerfile_python_base" ]; then
    WORK_DIR="$SCRIPT_DIR"
elif [ -f "$SCRIPT_DIR/../Dockerfile_python_base" ]; then
    WORK_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
    echo "错误: 在 $SCRIPT_DIR 及上级目录均未找到 Dockerfile_python_base"
    exit 1
fi

cd "$WORK_DIR" || exit 1
pwd

echo "加载环境变量..."
# 查找 .env：依次尝试 工作目录 / 脚本目录 / 工作目录上级
ENV_FILE=""
for f in "$WORK_DIR/.env" "$SCRIPT_DIR/.env" "$WORK_DIR/../.env"; do
    if [ -f "$f" ]; then
        ENV_FILE="$f"
        break
    fi
done
if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ]; then
    # tr -d '\r' 兼容 Windows 下编辑产生的 CRLF：否则 PASSWORD 尾部会带上 \r，docker login 会认证失败
    # 不用 <(...) 进程替换，改为临时文件：兼容 dash(sh)，避免 syntax error near unexpected token `('
    TMP_ENV="$(mktemp)"
    tr -d '\r' < "$ENV_FILE" > "$TMP_ENV"
    # set -a 让后续所有赋值自动 export
    set -a
    # shellcheck disable=SC1090
    . "$TMP_ENV"
    set +a
    rm -f "$TMP_ENV"
else
    echo "错误: 未找到 .env 文件（已尝试 $WORK_DIR/.env 、$SCRIPT_DIR/.env 、$WORK_DIR/../.env ）"
    exit 1
fi

# 校验必需变量，避免 docker login 用空账号密码静默失败
if [ -z "$USERNAME" ] || [ -z "$PASSWORD" ]; then
    echo "错误: .env 中的 USERNAME / PASSWORD 未设置"
    exit 1
fi

# 设置变量
IMAGE_NAME="python_base"
IMAGE_TAG="3.8.20"
DOCKERFILE_PATH="./Dockerfile_python_base"
BUILD_CONTEXT="./"
REGISTRY="registry.cn-hangzhou.aliyuncs.com"
NAMESPACE="baimeidashu"
FULL_IMAGE="$REGISTRY/$NAMESPACE/$IMAGE_NAME:$IMAGE_TAG"

# 构建 Docker 镜像（--network=host 让构建容器复用宿主机网络，避开容器内 DNS/SSL 不通）
docker build -t $IMAGE_NAME:$IMAGE_TAG -f $DOCKERFILE_PATH $BUILD_CONTEXT --network=host

# 登录镜像仓库并推送
docker login $REGISTRY -u $USERNAME -p $PASSWORD

docker tag $IMAGE_NAME:$IMAGE_TAG $FULL_IMAGE
docker push $FULL_IMAGE

# 输出构建完成信息
echo "$FULL_IMAGE   built successfully."
