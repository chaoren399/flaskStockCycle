# convert_csv_to_json.py
import pandas as pd
import json

# 获取CSV文件
file_path = 'D:\\03-code\\pycharm\\stock\\flaskStockCycle\\bak\\data-仅最高板.csv'
df = pd.read_csv(file_path, encoding='gbk', header=None)

# 设置列名
df.columns = ['Date', 'Value', 'StockName']

# 将日期列转换为日期格式
df['Date'] = pd.to_datetime(df['Date'], format='%Y年%m月%d日', errors='coerce')

# 检查是否有转换失败的日期
if df['Date'].isnull().any():
    print("存在无法转换的日期：")
    print(df[df['Date'].isnull()])

# 按日期排序
df = df.dropna(subset=['Date']).sort_values(by='Date')

# 将数据转换为JSON格式
data = {
    'labels': df['Date'].dt.strftime('%Y-%m-%d').tolist(),
    'datasets': [{
        'label': '数值',
        'data': df['Value'].tolist(),
        'backgroundColor': 'rgba(75, 192, 192, 0.2)',
        'borderColor': 'rgba(75, 192, 192, 1)',
        'borderWidth': 1,
        'fill': False  # 使用Python的布尔值False
    }]
}

# 将数据保存为JavaScript文件
with open('data.js', 'w', encoding='utf-8') as f:
    f.write('const stockData = ' + json.dumps(data, ensure_ascii=False) + ';')
