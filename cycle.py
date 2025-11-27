from flask import Flask, render_template, request, redirect, url_for
import pandas as pd

app = Flask(__name__)

CSV_FILE = 'data.csv'
# CSV_FILE = 'data1.csv'

#1 情绪图展示页：

# 1 baimei ，csv数据编辑页
@app.route('/baimei')
def index():

    #处理 index.html  首页，显示数据带有小数的问问题
    #如果想让某一列显示整数，那么就添加这个表头
    # Int64 类型可以处理 NaN 值
    # df = pd.read_csv(CSV_FILE, dtype={"压力高度":'Int64',"大面数":'Int64',"最高板":'Int64',"连板数":'Int64',"大肉情绪":'Int64',"跌停数量":'Int64',"涨停数量":'Int64',"封板率":'Int64',"涨停打开":'Int64'})
    df = pd.read_csv(CSV_FILE, dtype={"压力高度":'Int64',"大面数":'Int64',"最高板":'Int64',"连板数":'Int64',"大肉情绪":'Int64',"跌停数量":'Int64',"涨停数量":'Int64',"封板率":'Int64',"情绪值":'Int64',"涨停打开":'Int64'})

    #2025年8月17日 新增功能
    # 添加星期几的计算（处理中文日期格式）
    # 首先将中文日期格式转换为标准日期格式
    df['日期'] = df['日期'].str.replace('年', '-').str.replace('月', '-').str.replace('日', '')
    df['日期'] = pd.to_datetime(df['日期'], format='%Y-%m-%d', errors='coerce')
    df['周几'] = df['日期'].dt.day_name()

    # 中文星期映射
    weekday_mapping = {
        'Monday': '周一',
        'Tuesday': '周二',
        'Wednesday': '周三',
        'Thursday': '周四',
        'Friday': '周五',
        'Saturday': '周六',
        'Sunday': '周日'
    }
    df['周几'] = df['周几'].map(weekday_mapping).fillna('')

    # 转换回中文日期格式用于显示
    df['日期'] = df['日期'].dt.strftime('%Y年%m月%d日')


    return render_template('index.html', data=df.to_dict(orient='records'))


# 编辑页面：显示和处理编辑操作
@app.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit(id):
    df = pd.read_csv(CSV_FILE)

    if request.method == 'POST':
        # 更新数据
        df.at[id, '日期'] = request.form['日期']
        df.at[id, '大肉情绪'] = request.form['大肉情绪']
        df.at[id, '每日交易量'] = request.form['每日交易量']
        df.at[id, '上涨比率'] = request.form['上涨比率']
        df.at[id, '连板数'] = request.form['连板数']
        df.at[id, '最高板'] = request.form['最高板']
        df.at[id, '大面数'] = request.form['大面数']
        df.at[id, '其他'] = request.form['其他']
        df.at[id, '压力高度'] = request.form['压力高度']
        df.at[id, '跌停数量'] = request.form['跌停数量']
        df.at[id, '涨停数量'] = request.form['涨停数量']  # 新增涨停数量字段

        df.at[id, '封板率'] = request.form['封板率']  # 新增封板率字段

        df.at[id, '涨停打开'] = request.form['涨停打开']  # 新增涨停打开字段
        df.at[id, '情绪值'] = request.form['情绪值']  #  新增情绪值字段
        df.at[id, '备注'] = request.form['备注']  # 新增备注字段

        df.to_csv(CSV_FILE, index=False)
        return redirect(url_for('index'))

    row = df.iloc[id].to_dict()
    return render_template('edit.html', row=row, id=id)


# 新增页面：显示和处理新增操作
@app.route('/add', methods=['GET', 'POST'])
def add():
    if request.method == 'POST':
        new_data = {
            '日期': request.form['日期'],
            '大肉情绪': request.form['大肉情绪'],
            '每日交易量': request.form['每日交易量'],
            '上涨比率': request.form['上涨比率'],
            '连板数': request.form['连板数'],
            '最高板': request.form['最高板'],
            '大面数': request.form['大面数'],
            '其他': request.form['其他'],
            '压力高度': request.form['压力高度'],
            '跌停数量': request.form['跌停数量'],
            '涨停数量': request.form['涨停数量'], # 新增涨停数量字段
            '封板率': request.form['封板率'],  # 新增封板率字段
            '涨停打开': request.form['涨停打开'],  # 新增涨停打开字段
            '情绪值': request.form['情绪值'],  # 新增情绪值字段
            '备注': request.form['备注']  # 新增备注字段
        }

        df = pd.read_csv(CSV_FILE)
        # 将新数据插入到 DataFrame 的第一行
        df = pd.concat([pd.DataFrame([new_data]), df], ignore_index=True)
        df.to_csv(CSV_FILE, index=False)
        return redirect(url_for('index'))

    return render_template('add.html')


# 2 周期图展示页
@app.route('/zhouqi')
def zhouqi():
    msg = " \n my name is baimeidashu.com , China up!"

    if(0):
        # 读取Excel文件
        excel_file = './data/9-情绪周期图.xlsx'
        df = pd.read_excel(excel_file)

        # 将DataFrame保存为CSV文件
        csv_file = './data/example.csv'
        df.to_csv(csv_file, index=False)
        df = df.replace(np.nan, 0)  # 将NaN替换为0

    stockdata_path = './data/example.csv'

    df = pd.read_csv(stockdata_path)
    #日期
    df0=df.iloc[:,0].values.tolist() #把列转化为数组格式为了支持js

    print(df0)
   #每日涨停数
    df1=df.iloc[:,1].values.tolist()
    #每日交易量（万亿）

    df2=df.iloc[:,2].values.tolist()
    #,上涨比率,
    df3=df.iloc[:,3].values.tolist()
    #最高连板,最高板
    df4=df.iloc[:,4].values.tolist()
    #最高板
    df5=df.iloc[:,5].values.tolist()

    #大面数
    df6=df.iloc[:,6].values.tolist()

    #最高板名称
    df7=df.iloc[:,7].values.tolist()



    print( df2)


    return render_template("cycle.html" ,df0 =df0,df1=df1,df2=df2,df3=df3,df4=df4,df5=df5,df6=df6,df7=df7)



# 2 周期图展示页
@app.route('/qingxu')
def qingxu():
    msg = " \n my name is baimeidashu.com , China up!"



    # stockdata_path = './data/example.csv'
    stockdata_path = 'data.csv'

    df = pd.read_csv(stockdata_path)
    #获取最近3个月数据：
    # 获取最近90个数据条目
    # df = df.tail(65)
    # df = df.head(65)

    # 按照索引进行倒序排序
    df = df.sort_index(ascending=False)
    #日期
    df0=df.iloc[:,0].values.tolist() #把列转化为数组格式为了支持js

    print(df0)
   #每日涨停数
    df1=df.iloc[:,1].values.tolist()
    #每日交易量（万亿）
    df2=df.iloc[:,2].values.tolist()
    #,上涨比率,
    df3=df.iloc[:,3].values.tolist()
    #最高连板,最高板
    df4=df.iloc[:,4].values.tolist()
    #最高板
    df5=df.iloc[:,5].values.tolist()

    #大面数
    df6=df.iloc[:,6].values.tolist()

    #最高板名称
    df7=df.iloc[:,7].values.tolist()
    #压力高度
    df8=df.iloc[:,8].values.tolist()
    #其他2
    df9=df.iloc[:,9].values.tolist()

    print( df2)
    print ('------------------------qignxu------------------')
    print( df)



    # print(df_sorted_index)


    return render_template("cycle.html" ,df0 =df0,df1=df1,df2=df2,df3=df3,df4=df4,df5=df5,df6=df6,df7=df7,df8=df8,df9=df9)


###########################以下是测试##########################
@app.route('/test')
def test():
    stockdata_path = 'data.csv'
    df = pd.read_csv(stockdata_path)
    #获取最近3个月数据：
    df = df.head(65)
    # 按照索引进行倒序排序
    df = df.sort_index(ascending=False)
    #日期
    df0=df.iloc[:,0].values.tolist() #把列转化为数组格式为了支持js
   #每日涨停数
    df1=df.iloc[:,1].values.tolist()
    #每日交易量（万亿）
    df2=df.iloc[:,2].values.tolist()
    #,上涨比率,
    df3=df.iloc[:,3].values.tolist()
    #最高连板,最高板
    df4=df.iloc[:,4].values.tolist()
    #最高板
    df5=df.iloc[:,5].values.tolist()
    #大面数
    df6=df.iloc[:,6].values.tolist()
    #最高板名称
    df7=df.iloc[:,7].values.tolist()
    #压力高度
    df8=df.iloc[:,8].values.tolist()
    #其他2
    df9=df.iloc[:,9].values.tolist()

    return render_template("./demo/test1.html" ,df0 =df0,df1=df1,df2=df2,df3=df3,df4=df4,df5=df5,df6=df6,df7=df7,df8=df8,df9=df9)


@app.route('/test2')
def test2():
    stockdata_path = 'data.csv'
    df = pd.read_csv(stockdata_path)
    #获取最近3个月数据：
    df = df.head(65)
    # 按照索引进行倒序排序
    df = df.sort_index(ascending=False)
    #日期
    df0=df.iloc[:,0].values.tolist() #把列转化为数组格式为了支持js
   #每日涨停数
    df1=df.iloc[:,1].values.tolist()
    #每日交易量（万亿）
    df2=df.iloc[:,2].values.tolist()
    #,上涨比率,
    df3=df.iloc[:,3].values.tolist()
    #最高连板,最高板
    df4=df.iloc[:,4].values.tolist()
    #最高板
    df5=df.iloc[:,5].values.tolist()
    #大面数
    df6=df.iloc[:,6].values.tolist()
    #最高板名称
    df7=df.iloc[:,7].values.tolist()
    #压力高度
    df8=df.iloc[:,8].values.tolist()
    #其他2
    df9=df.iloc[:,9].values.tolist()

    return render_template("./demo/test2.html" ,df0 =df0,df1=df1,df2=df2,df3=df3,df4=df4,df5=df5,df6=df6,df7=df7,df8=df8,df9=df9)

@app.route('/test3')
def test3():
    stockdata_path = 'data.csv'
    df = pd.read_csv(stockdata_path)
    #获取最近3个月数据：
    # df = df.head(65)
    # 按照索引进行倒序排序
    df = df.sort_index(ascending=False)
    #日期
    df0=df.iloc[:,0].values.tolist() #把列转化为数组格式为了支持js
   #每日涨停数
    df1=df.iloc[:,1].values.tolist()
    #每日交易量（万亿）
    df2=df.iloc[:,2].values.tolist()
    #,上涨比率,
    df3=df.iloc[:,3].values.tolist()
    #最高连板,最高板
    df4=df.iloc[:,4].values.tolist()
    #最高板
    df5=df.iloc[:,5].values.tolist()
    #大面数
    df6=df.iloc[:,6].values.tolist()
    #最高板名称
    df7=df.iloc[:,7].values.tolist()
    #压力高度
    df8=df.iloc[:,8].values.tolist()
    #其他2
    df9=df.iloc[:,9].values.tolist()

    return render_template("./demo/test3.html" ,df0 =df0,df1=df1,df2=df2,df3=df3,df4=df4,df5=df5,df6=df6,df7=df7,df8=df8,df9=df9)



@app.route('/test4')
def test4():
    # 示例数据
    data = {
        'date': ['2025-02-12', '2025-02-13', '2025-02-14', '2025-02-17', '2025-02-18', '2025-02-19', '2025-02-20',
                 '2025-02-21', '2025-02-24', '2025-02-25', '2025-02-26', '2025-02-27', '2025-02-28', '2025-03-03',
                 '2025-03-04', '2025-03-05'],
        'value': [10, 10, 8, 8, 6, 7, 8, 8, 8, 5, 4, 5, 6, 6, 4, 5],
        'stocks': [
            '新炬网络', '梦网科技', '梦网科技', '威派格', '杭齿前进', '杭齿前进', '杭齿前进', '卓翼科技', '卓翼科技',
            '欢瑞世纪', '圣阳股份', '庄园牧场', '华丰股份', '恒为科技', '天正电气', '天正电气'
        ]
    }

    df = pd.DataFrame(data)
    return render_template('./demo/test4.html', df=df.to_dict(orient='records'))

if __name__ == '__main__':
    # app.run(debug=True,host='0.0.0.0')
    app.run(host='0.0.0.0', port=5000)