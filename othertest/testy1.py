def main(x: str, y: str) -> dict:
    xs = x.split(',')
    countx = len(xs)
    ys = y.split(',')
    county = len(ys)
    if (countx + county != 6):
        return {
            "result": "输入必须3个参数"
        }
    else :
        x1 = xs[0]
        x2 = xs[1]
        x3 = xs[2]

        y1 = ys[0]
        y2 = ys[1]
        y3 = ys[2]

        x1 = int(x1)
        x2 = int(x2)
        x3 = int(x3)
        y1 = int(y1)
        y2 = int(y2)
        y3 = int(y3)

        z1 = 2 * x1 + 1
        z2 = 3 * x2 + 1
        z3 = 4 * x3 + 1
        out = ""
        if (y1 != z1):
            t1 = str(x1)
            if (y1 < z1):
                out = out + "(第1个参数" + t1 + "过大)"
            if (y1 > z1):
                out = out + "(第1个参数" + t1 + "过小)"
            out = out + ""
        if (y2 != z2):
            t1 = str(x2)
            if (y2 < z2):
                out = out + "(第2个参数" + t1 + "过大)"
            if (y2 > z2):
                out = out + "(第2个参数" + t1 + "过小)"

            out = out + ""
        if (y3 != z3):
            t1 = str(x3)
            if (y3 < z3):
                out = out + "(第3个参数" + t1 + "过大)"
            if (y3 > z3):
                out = out + "(第3个参数" + t1 + "过小)"

            out = out + ""

        return {
            "result": "结果异常是由于" + out + "引起的"
        }


