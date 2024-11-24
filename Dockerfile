##第一部分 基础镜像部分
FROM centos:7.9.2009
##第2部分： 维护者信息
LABEL  mainatiner="baimeidashu"

##第3部分： 镜像操作指令

#添加软件源进行加速
RUN curl  -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo

#安装epel软件源
RUN curl  -o /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo


RUN yum makecache fast;
ENV PIP_INDEX_URL=https://mirrors.aliyun.com/pypi/simple/
ENV PIP_TRUSTED_HOST=mirrors.aliyun.com

RUN yum install python3-devel python3-pip -y

RUN pip3 install  flask

#设置工作目录为/app
WORKDIR /app
COPY .  /app


#暴露的端口号与入口文件定义的端口号保持一致
EXPOSE 2020


##第4部分： CMD 命令
CMD ["python3","demo1.py"]
