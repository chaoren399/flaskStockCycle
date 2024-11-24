from urllib import request

from flask import Flask, render_template, session, redirect, url_for
import pandas as pd
import numpy as np
app = Flask(__name__)


@app.route('/')
def index():
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


   #每日涨停数
    df1=df.iloc[:,1].values.tolist()
    #每日交易量（万亿）

    df2=df.iloc[:,1].values.tolist()
    #,上涨比率,
    df3=df.iloc[:,2].values.tolist()
    #最高连板,最高板
    df4=df.iloc[:,3].values.tolist()
    #最高板
    df5=df.iloc[:,4].values.tolist()



    print( df2)


    return render_template("cycle.html" ,df0 =df0,df1=df1,df2=df2,df3=df3,df4=df4,df5=df5)

@app.route('/getdata')
def getdata():
    stockdata_path = './data/test.csv'
    # print stockdata_path
    df = pd.read_csv(stockdata_path, index_col=0)
    stockinfo=df
    print(df)


    return render_template('cycle.html', stockinfo=stockinfo)



@app.route('/loginProcess',methods=['POST','GET'])
def loginProcesspage():
    if request.method=='POST':
        nm=request.form['nm']
        pwd=request.form['pwd']
        if nm=='cao' and pwd=='123':
            session['username']=nm             #使用session存储方式，session默认为数组，给定key和value即可
            return redirect(url_for('index'))  #重定向跳转到首页
        else:
            return 'the username or userpwd does not match!'

if __name__ == "__main__":
    # app.run(port=2020, host="127.0.0.1", debug=True)
    app.run(port=2020, host="0.0.0.0")