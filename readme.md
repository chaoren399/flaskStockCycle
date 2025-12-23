https://github.com/chaoren399/flaskStockCycle.git


部署： 
测试环境：   
build/build_uat.sh (这是测试环境用的， 用docker-compose 方式构建)

生产环境：
git config --global http.proxy 'socks5://192.168.120.237:1081'
git config --global https.proxy 'socks5://192.168.120.237:1081'

10.0.0.215 
build/build_prod.sh (这是生产环境用的， 用docker-compose 构建)
再本地机器上先执行bulid_prod.sh 构建镜像 上传到阿里云 (需要把.env 文件复制到 脚本的当前目录目录下， 然后执行脚本)
然后再用docker-compose.yaml 文件 再生产服务器上运行
定时备份 data.csv 文件
chmod +x backup_data.sh
# 编辑定时任务
crontab -e
# 添加以下行实现每天定时备份（例如每天晚上9点执行）
0 21 * * * cd /app/4zhouqi && ./backup_data.sh >> ./bak/backup.log 2>&1


#内网穿透：

https://www.baimeidashu.com/20391.html


在首页 index.html  上涨比率 在5到25之间标红色




运行： cycle.py 

http://127.0.0.1:5000/qingxu

http://127.0.0.1:5000/baimei

http://ks1.k8sdashu.cn:6004/qingxu

python=3.8.20

flask==3.0.3
pandas==2.0.3



echarts中dataZoom来控制默认显示固定条数数据（可自定义）
https://blog.csdn.net/qq_45094682/article/details/122573479
#修改 图形中的dataZoom
在cycle.html 中找到对应模块的 dataZoom
dataZoom



#统计 多少个试题： 去除了重复的名称， 

SELECT COUNT(DISTINCT name) FROM `t_template`;



SELECT count(name)  FROM t_template;

0x7B226964223A2250485A52222C227469746C65223A22E6B5B7E99485E882A1E4BBBD222C2274797065223A22436865636B626F78222C22617474726962757465223A7B226578616D416E737765724D6F6465223A2273656C656374416C6C227D2C226368696C6472656E223A5B7B226964223A2262304D43222C227469746C65223A22E8B584E6BA90E5BC80E58F912DE585B6E4BB96E8AEBEE5A487222C22617474726962757465223A7B7D7D2C7B226964223A223241704D222C227469746C65223A22E6B2B9E6B094E8A385E5A487E994BBE4BBB6222C22617474726962757465223A7B7D7D2C7B226964223A2247323634222C227469746C65223A22E88B8FE5B79E222C22617474726962757465223A7B7D7D5D7D 是什么编码格式
解码后的内容如下：
{
  "id": "PHZR",
  "title": "资源开发—其它设备",
  "type": "Checkbox",
  "attribute": {
    "examAnswerMode": "selectAll"
  },
  "children": [
    {
      "id": "b0MC",
      "title": "资源开发—其它设备",
      "attribute": {}
    },
    {
      "id": "2ApM",
      "title": "油气装备部件",
      "attribute": {}
    },
    {
      "id": "G264",
      "title": "苏州",
      "attribute": {}
    }
  ]
}

