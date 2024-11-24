import pandas as pd
import numpy as np

stockdata_path = './data/example.csv'
# print stockdata_path
df = pd.read_csv(stockdata_path, index_col=0)

df = pd.read_csv(stockdata_path)
first_column = df.iloc[:, 0]
print(first_column)


# print(df)
# {{df.iloc[:, 0]}}
# df1=df.iloc[:,0].reset_index(drop=True)
df1 = df.iloc[:, 1].to_numpy()  # 把列转化为数组格式为了支持js

# print(df.iloc[:,1].values.tolist())
print(df.loc[:,['日期']])

# print(df1)

# print(df.head())