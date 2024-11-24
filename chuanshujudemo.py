from flask import Flask, render_template

app = Flask(__name__)


# @app.route("/index")
@app.route("/")
def index():
    data = {
        'name': "张三",
        "age": 18,
    }
    return render_template("chuanshujudemo.html", data=data)


if __name__ == '__main__':
    app.run()