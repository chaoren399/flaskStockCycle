# -*- coding: utf-8 -*-
import matplotlib.pyplot as plt
import pandas as pd
# -*- coding: utf-8 -*-

data = {
    'date': ['2025-02-06', '2025-02-07', '2025-02-10', '2025-02-11', '2025-02-12', '2025-02-13', '2025-02-14', '2025-02-17', '2025-02-18', '2025-02-19', '2025-02-20', '2025-02-21', '2025-02-24', '2025-02-25', '2025-02-26', '2025-02-27'],
    'pressure_height': [6, 7, 8, 9, 10, 10, 10, 8, 8, 8, 6, 7, 8, 8, 5, 5],
    'latest_height': [6, 7, 8, 9, 10, 10, 10, 8, 8, 8, 6, 7, 8, 8, 5, 5],
    'stocks': [
        '新炬网络', '新炬网络', '新炬网络', '新炬网络', '梦网科技', '梦网科技', '威派格', '威派格', '杭齿前进', '杭齿前进', '卓翼科技', '卓翼科技', '欢瑞世纪', '圣阳股份', '庄园牧场', '大位科技'
    ]
}

df = pd.DataFrame(data)

# 创建图表
fig, ax = plt.subplots(figsize=(16, 8))

# 绘制压力高度折线图
ax.plot(df['date'], df['pressure_height'], marker='o', linestyle='-', color='orange', label='压力高度')
for i, txt in enumerate(df['pressure_height']):
    ax.annotate(txt, (df['date'][i], df['pressure_height'][i]), textcoords="offset points", xytext=(0,10), ha='center')

# 绘制最新高度折线图
ax.plot(df['date'], df['latest_height'], marker='o', linestyle='--', color='purple', label='最新高度')
for i, txt in enumerate(df['latest_height']):
    ax.annotate(txt, (df['date'][i], df['latest_height'][i]), textcoords="offset points", xytext=(0,-10), ha='center')

# 设置图表标题和标签
ax.set_title('情绪高度图')
ax.set_xlabel('日期')
ax.set_ylabel('高度值')
ax.legend()

# 设置x轴刻度
ax.set_xticks(df['date'])
ax.set_xticklabels(df['date'], rotation=45)

# 显示表格
table_data = [df.columns.values.tolist()] + df.values.tolist()
table = plt.table(cellText=table_data[1:], colLabels=table_data[0], cellLoc='center', loc='bottom', bbox=[0, -0.5, 1, 0.5])

plt.tight_layout()
plt.show()
