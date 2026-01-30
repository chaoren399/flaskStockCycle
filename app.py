from flask import Flask, render_template, request, redirect, url_for
import pandas as pd

app = Flask(__name__)

CSV_FILE = 'data2.csv'

#1 情绪图展示页：
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



    print( df2)


    return render_template("cycle.html" ,df0 =df0,df1=df1,df2=df2,df3=df3,df4=df4,df5=df5)


#2 csv 编辑 功能
@app.route('/baimei')
def baimei_index():
    df = pd.read_csv(CSV_FILE)
    return render_template('csv/index.html', data=df.to_dict(orient='records'))


@app.route('/baimei/add', methods=['GET', 'POST'])
def add_entry():
    if request.method == 'POST':
        name = request.form.get('name')
        age = request.form.get('age')
        email = request.form.get('email')

        df = pd.read_csv(CSV_FILE)
        new_row = pd.DataFrame({'Name': [name], 'Age': [age], 'Email': [email]})
        df = pd.concat([df, new_row], ignore_index=True)
        df.to_csv(CSV_FILE, index=False)

        return redirect(url_for('baimei_index'))
    return render_template('csv/add.html')


@app.route('/baimei/edit/<int:index>', methods=['GET', 'POST'])
def edit_entry(index):
    df = pd.read_csv(CSV_FILE)
    if request.method == 'POST':
        df.at[index, 'Name'] = request.form.get('name')
        df.at[index, 'Age'] = request.form.get('age')
        df.at[index, 'Email'] = request.form.get('email')
        df.to_csv(CSV_FILE, index=False)

        return redirect(url_for('baimei_index'))

    entry = df.loc[index].to_dict()
    return render_template('csv/edit.html', entry=entry, index=index)


if __name__ == '__main__':
    app.run(debug=True)