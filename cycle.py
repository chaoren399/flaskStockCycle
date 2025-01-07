from flask import Flask, render_template, request, redirect, url_for
import pandas as pd

app = Flask(__name__)

CSV_FILE = 'data.csv'
# CSV_FILE = 'data1.csv'

#1 情绪图展示页：

# 1 baimei ，csv数据编辑页
@app.route('/baimei')
def index():
    df = pd.read_csv(CSV_FILE)
    return render_template('index.html', data=df.to_dict(orient='records'))


# 编辑页面：显示和处理编辑操作
@app.route('/edit/<int:id>', methods=['GET', 'POST'])
def edit(id):
    df = pd.read_csv(CSV_FILE)

    if request.method == 'POST':
        # 更新数据
        df.at[id, '日期'] = request.form['日期']
        df.at[id, '每日涨停数'] = request.form['每日涨停数']
        df.at[id, '每日交易量'] = request.form['每日交易量']
        df.at[id, '上涨比率'] = request.form['上涨比率']
        df.at[id, '连板数'] = request.form['连板数']
        df.at[id, '最高板'] = request.form['最高板']
        df.at[id, '大面数'] = request.form['大面数']
        df.at[id, '其他'] = request.form['其他']

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
            '每日涨停数': request.form['每日涨停数'],
            '每日交易量': request.form['每日交易量'],
            '上涨比率': request.form['上涨比率'],
            '连板数': request.form['连板数'],
            '最高板': request.form['最高板'],
            '大面数': request.form['大面数'],
            '其他': request.form['其他']
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


@app.route('/test')
def test():
    return render_template('./demo/test.html')


# 2 周期图展示页
@app.route('/qingxu')
def qingxu():
    msg = " \n my name is baimeidashu.com , China up!"



    # stockdata_path = './data/example.csv'
    stockdata_path = 'data.csv'

    df = pd.read_csv(stockdata_path)
    #获取最近3个月数据：
    # 获取最近90个数据条目
    df = df.tail(60)

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

    print( df2)
    print( df)



    # print(df_sorted_index)


    return render_template("cycle.html" ,df0 =df0,df1=df1,df2=df2,df3=df3,df4=df4,df5=df5,df6=df6,df7=df7)




if __name__ == '__main__':
    # app.run(debug=True,host='0.0.0.0')
    app.run(host='0.0.0.0', port=5000)