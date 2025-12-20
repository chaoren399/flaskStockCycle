class StockDataChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId)
    if (!this.canvas) {
      console.error("Canvas element not found")
      return
    }

    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })
    this.setupCanvas()
    window.addEventListener("resize", () => this.setupCanvas())

    this.chartPadding = { top: 30, right: 40, bottom: 50, left: 45 }
    this.visibleLines = new Set([0, 1])
    this.offsetX = 0
    this.isMouseDown = false
    this.lastMouseX = 0
    this.visibleDaysCount = 15 // Default visible days, will be adjusted after data loads
    this.tooltipVisible = false
    this.tooltipData = {}
    
    // 保存所有原始公司名称的内容，避免后续调用时丢失
    this.companyNamesContent = []
    
    // 延迟保存，确保DOM已完全加载
    setTimeout(() => {
      const allCompanyNames = Array.from(document.querySelectorAll('.company-name'))
      this.companyNamesContent = allCompanyNames.map(nameElement => nameElement.innerHTML)
    }, 0)

    this.setupEventListeners()
    this.loadChartData()
  }

  // 加载图表数据
  loadChartData() {
    console.log('开始加载CSV数据...');
    
    // 使用fetch API获取CSV数据
    fetch('./data.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 获取arraybuffer响应，以便检测编码
        return response.arrayBuffer();
      })
      .then(arrayBuffer => {
        // 检测编码并解码
        const csvText = this.detectAndDecode(arrayBuffer);
        console.log('CSV数据加载成功');
        
        // 解析CSV数据
        const processedData = this.parseCSVWithSimpleLogic(csvText);
        
        // 更新图表数据
        this.updateChartWithData(processedData);
      })
      .catch(error => {
        console.error('加载CSV数据失败:', error);
        this.useDefaultData();
      });
  }
  
  // 使用简单的逻辑解析CSV数据
  parseCSVWithSimpleLogic(csvText) {
    console.log('使用简单逻辑解析CSV数据...');
    
    // 处理BOM头
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
    }
    
    // 处理换行符
    csvText = csvText.replace(/\r\n/g, '\n');
    csvText = csvText.replace(/\r/g, '\n');
    
    // 按行分割
    const lines = csvText.split('\n');
    
    // 过滤空行
    const nonEmptyLines = lines.filter(line => line.trim() !== '');
    
    if (nonEmptyLines.length < 2) {
      throw new Error('CSV数据为空或格式不正确');
    }
    
    // 跳过表头，处理数据行
    const processedData = [];
    for (let i = 1; i < nonEmptyLines.length; i++) {
      const line = nonEmptyLines[i];
      
      // 简单的按逗号分割，适用于没有复杂引号结构的CSV
      const fields = line.split(',').map(field => field.trim());
      
      // 确保字段数量足够
      if (fields.length < 14) {
        console.warn(`第${i+1}行字段数量不足，跳过`);
        continue;
      }
      
      // 提取所需字段
      processedData.push({
        date: fields[0] || '',
        companyName: fields[7] || '',
        continuousBoardCount: parseFloat(fields[1]) || 0,
        riseRatio: parseFloat(fields[3]) || 0,
        bigProfitEmotion: parseFloat(fields[4]) || 0,
        latestHeight: parseFloat(fields[5]) || 0,
        bigLossEmotion: parseFloat(fields[6]) || 0,
        pressureHeight: parseFloat(fields[8]) || 0,
        emotionValue: parseFloat(fields[13]) || 0
      });
    }
    
    // 反转数据，使最新日期在前
    const reversedData = processedData.reverse();
    
    // 实现数据、日期和公司名称都往左移动一列的效果
    // 方法：在数据末尾添加一条空数据
    if (reversedData.length > 0) {
      // 获取最新日期
      const latestDate = reversedData[0].date;
      
      // 在数组末尾添加一条空数据
      reversedData.push({
        date: '',
        companyName: '',
        continuousBoardCount: 0,
        riseRatio: 0,
        bigProfitEmotion: 0,
        latestHeight: 0,
        bigLossEmotion: 0,
        pressureHeight: 0,
        emotionValue: 0
      });
    }
    
    return reversedData;
  }
  
  // 使用处理后的数据更新图表
  updateChartWithData(processedData) {
    console.log('处理后的数据行数:', processedData.length);
    
    if (processedData.length === 0) {
      throw new Error('处理后的数据为空');
    }
    
    // 提取所需字段
    this.dates = processedData.map(item => item.date);
    
    // 实现数据、日期和公司名称都往左移动一列
    // 直接提取所有公司名称
    this.companyNamesContent = processedData
      .map(item => item.companyName.replace(/-/g, '<br>'));
    
    // 如果公司名称数组为空，添加一个空字符串作为默认值
    if (this.companyNamesContent.length === 0) {
      this.companyNamesContent = [''];
    }
    
    // 生成图表数据
    this.lines = [
      {
        "name": "压力高度",
        "data": processedData.map(item => item.pressureHeight),
        "color": "#FF6B35",
        "type": "solid",
        "axis": "left"
      },
      {
        "name": "最新高度",
        "data": processedData.map(item => item.latestHeight),
        "color": "#9D5FFF",
        "type": "dashed",
        "axis": "left"
      },
      {
        "name": "上涨比率",
        "data": processedData.map(item => item.riseRatio),
        "color": "#FF9F43",
        "type": "solid",
        "axis": "right"
      },
      {
        "name": "大面情绪",
        "data": processedData.map(item => item.bigLossEmotion),
        "color": "#00D4FF",
        "type": "solid",
        "axis": "right"
      },
      {
        "name": "大肉情绪",
        "data": processedData.map(item => item.bigProfitEmotion),
        "color": "#A29BFE",
        "type": "solid",
        "axis": "right"
      },
      {
        "name": "连板数",
        "data": processedData.map(item => item.continuousBoardCount),
        "color": "#FFD700",
        "type": "solid",
        "axis": "right"
      },
      {
        "name": "情绪值",
        "data": processedData.map(item => item.emotionValue),
        "color": "#FF6B9D",
        "type": "solid",
        "axis": "right"
      }
    ];
    
    // 更新滑块最大值
    this.updateSliderMax();
    
    // 绘制图表
    this.draw();
    console.log('图表绘制完成');
  }
  
  // 使用默认数据，当CSV加载失败时
  useDefaultData() {
    console.log('使用默认数据');
    this.dates = ['2025-12-05', '2025-12-04', '2025-12-03'];
    this.companyNamesContent = ['公司1', '公司2', '公司3'];
    this.lines = [
      { name: "压力高度", data: [5, 5, 5], color: "#FF6B35", type: "solid", axis: "left" },
      { name: "最新高度", data: [10, 11, 12], color: "#9D5FFF", type: "dashed", axis: "left" },
      { name: "上涨比率", data: [37.63, 82.67, 79.38], color: "#FF9F43", type: "solid", axis: "right" },
      { name: "大面情绪", data: [16, 6, 9], color: "#00D4FF", type: "solid", axis: "right" },
      { name: "大肉情绪", data: [110, 179, 260], color: "#A29BFE", type: "solid", axis: "right" },
      { name: "连板数", data: [24, 41, 83], color: "#FFD700", type: "solid", axis: "right" },
      { name: "情绪值", data: [0, 0, 0], color: "#FF6B9D", type: "solid", axis: "right" }
    ];
    this.draw();
  }
  
  // 更新滑块最大值
  updateSliderMax() {
    const sliderMin = document.getElementById("sliderMin");
    const sliderMax = document.getElementById("sliderMax");
    
    if (sliderMin && sliderMax) {
      const totalDays = this.dates.length;
      sliderMin.max = totalDays - 1;
      sliderMax.max = totalDays;
      
      // 设置初始值为显示最新的15条数据
      const startValue = Math.max(0, totalDays - this.visibleDaysCount);
      sliderMin.value = startValue;
      sliderMax.value = totalDays;
      
      // 设置初始显示范围
      this.startIndex = startValue;
      this.endIndex = totalDays;
    }
  }

  setupCanvas() {
    const container = this.canvas.parentElement
    const rect = container.getBoundingClientRect()
    this.canvas.width = rect.width
    this.canvas.height = rect.height
  }

  setupEventListeners() {
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e))
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e))
    this.canvas.addEventListener("mouseup", (e) => this.onMouseUp(e))
    this.canvas.addEventListener("mouseleave", (e) => this.onMouseUp(e))
    this.canvas.addEventListener("touchstart", (e) => this.onTouchStart(e))
    this.canvas.addEventListener("touchmove", (e) => this.onTouchMove(e))
    this.canvas.addEventListener("touchend", (e) => this.onTouchEnd(e))
    this.canvas.addEventListener("mousemove", (e) => this.onCanvasHover(e))
    this.canvas.addEventListener("mouseleave", () => this.hideTooltip())

    const sliderMin = document.getElementById("sliderMin")
    const sliderMax = document.getElementById("sliderMax")
    const sliderRange = document.querySelector(".slider-range")
    const sliderTrack = document.querySelector(".slider-track")

    if (sliderMin && sliderMax) {
      sliderMin.addEventListener("input", () => this.onDualSliderChange(sliderMin, sliderMax, sliderRange))
      sliderMax.addEventListener("input", () => this.onDualSliderChange(sliderMin, sliderMax, sliderRange))
      
      // Add drag functionality for the slider range - using class properties for proper this context
      this.sliderIsDragging = false
      this.sliderDragStartX = 0
      this.sliderInitialMin = 0
      this.sliderInitialMax = 0
      this.sliderTrack = sliderTrack
      this.sliderMin = sliderMin
      this.sliderMax = sliderMax
      this.sliderRange = sliderRange
      
      // Handle mouse down on slider track
      sliderTrack.addEventListener("mousedown", (e) => this.onSliderTrackMouseDown(e))
      
      // Handle mouse move to drag the range
      document.addEventListener("mousemove", (e) => this.onSliderTrackMouseMove(e))
      
      // Handle mouse up to stop dragging
      document.addEventListener("mouseup", () => this.onSliderTrackMouseUp())
      
      // Handle mouse leave to stop dragging
      document.addEventListener("mouseleave", () => this.onSliderTrackMouseUp())
    }

    const legendContainer = document.getElementById("legendContainer")
    if (legendContainer) {
      const legendItems = legendContainer.querySelectorAll(".legend-item")
      legendItems.forEach((item) => {
        item.addEventListener("click", (e) => this.onLegendClick(e))
        
        // 初始化可见图例项的active类
        const lineIndex = Number.parseInt(item.getAttribute("data-line-index"))
        if (this.visibleLines.has(lineIndex)) {
          item.classList.add("active")
        }
      })
    }
    
    // 添加文件上传事件监听
    this.setupFileUploadListeners()
  }
  
  // 设置文件上传事件监听
  setupFileUploadListeners() {
    const uploadBtn = document.getElementById("uploadBtn")
    const csvUpload = document.getElementById("csvUpload")
    
    if (uploadBtn && csvUpload) {
      // 点击上传按钮触发文件选择
      uploadBtn.addEventListener("click", () => {
        csvUpload.click()
      })
      
      // 监听文件选择事件
      csvUpload.addEventListener("change", (e) => {
        this.handleFileUpload(e)
      })
    }
  }
  
  // 处理文件上传
  handleFileUpload(event) {
    const file = event.target.files[0]
    if (!file) return
    
    // 检查文件类型
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('请选择CSV格式的文件')
      return
    }
    
    console.log('开始读取上传的CSV文件:', file.name)
    
    // 使用FileReader读取文件为ArrayBuffer，以便检测编码
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result
        
        // 检测编码并解码文件内容
        const csvText = this.detectAndDecode(arrayBuffer)
        console.log('CSV文件读取成功')
        
        // 解析CSV数据
        const processedData = this.parseCSVWithSimpleLogic(csvText)
        
        // 更新图表数据
        this.updateChartWithData(processedData)
        
        // 清空文件选择，允许重复上传同一文件
        event.target.value = ''
      } catch (error) {
        console.error('处理上传的CSV文件失败:', error)
        alert('处理CSV文件失败: ' + error.message)
        // 清空文件选择
        event.target.value = ''
      }
    }
    
    reader.onerror = () => {
      console.error('读取CSV文件失败')
      alert('读取CSV文件失败')
      // 清空文件选择
      event.target.value = ''
    }
    
    // 读取文件为ArrayBuffer，以便检测编码
    reader.readAsArrayBuffer(file)
  }
  
  // 检测并解码文件内容
  detectAndDecode(arrayBuffer) {
    // 检测BOM头
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // 尝试不同编码解码
    try {
      // 检测UTF-8 BOM
      if (uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
        // UTF-8 with BOM
        return new TextDecoder('utf-8').decode(uint8Array.slice(3))
      }
      
      // 尝试UTF-8解码
      const utf8Decoder = new TextDecoder('utf-8', { fatal: true })
      return utf8Decoder.decode(uint8Array)
    } catch (e) {
      // UTF-8解码失败，尝试GBK编码
      try {
        // 对于Node.js环境，可以使用iconv-lite库，但在浏览器中需要使用TextDecoder
        // 检查浏览器是否支持GBK编码
        if (typeof TextDecoder === 'function' && TextDecoder.prototype.decode.name === 'decode') {
          try {
            // 尝试使用GBK编码
            return new TextDecoder('gbk').decode(uint8Array)
          } catch (e) {
            // GBK编码也失败，尝试使用gb18030编码
            return new TextDecoder('gb18030').decode(uint8Array)
          }
        } else {
          // 浏览器不支持TextDecoder，使用默认编码
          return new TextDecoder().decode(uint8Array)
        }
      } catch (e) {
        // 所有编码都失败，使用默认编码
        return new TextDecoder().decode(uint8Array)
      }
    }
  }

  onLegendClick(event) {
    const legendItem = event.currentTarget
    const lineIndex = Number.parseInt(legendItem.getAttribute("data-line-index"))

    if (this.visibleLines.has(lineIndex)) {
      this.visibleLines.delete(lineIndex)
      legendItem.classList.remove("active")
    } else {
      this.visibleLines.add(lineIndex)
      legendItem.classList.add("active")
    }

    this.draw()
  }

  draw() {
    this.ctx.fillStyle = "#0a0e27"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const chartWidth = this.canvas.width - this.chartPadding.left - this.chartPadding.right
    const chartHeight = this.canvas.height - this.chartPadding.top - this.chartPadding.bottom

    // Fix the slider logic: startIndex and endIndex should represent the range of days to show
    // The slider values (0-30) correspond to positions in the 30-day data array
    const totalDays = this.dates.length
    
    let visibleDates, visibleLines, startIndex, endIndex
    
    if (this.startIndex !== undefined && this.endIndex !== undefined) {
      // When slider is used, use the exact range specified by the slider
      // The slider values directly map to array indices
      startIndex = this.startIndex
      endIndex = this.endIndex
      visibleDates = this.dates.slice(startIndex, endIndex)
      visibleLines = this.lines
        .map((line, index) => ({
          ...line,
          data: line.data.slice(startIndex, endIndex),
          index: index,
        }))
        .filter((line) => this.visibleLines.has(line.index))
    } else {
      // Default behavior when no slider values are set
      startIndex = Math.max(0, totalDays - this.visibleDaysCount)
      endIndex = totalDays
      visibleDates = this.dates.slice(startIndex)
      visibleLines = this.lines
        .map((line, index) => ({
          ...line,
          data: line.data.slice(startIndex),
          index: index,
        }))
        .filter((line) => this.visibleLines.has(line.index))
    }

    // Group visible lines by axis (left or right)
    const leftAxisLines = visibleLines.filter(line => line.axis === "left")
    const rightAxisLines = visibleLines.filter(line => line.axis === "right")

    // Calculate data ranges for left axis
    let leftMinValue, leftMaxValue, leftYRange, leftYMin, leftYMax
    if (leftAxisLines.length > 0) {
      const leftValues = leftAxisLines.flatMap(line => line.data)
      leftMinValue = Math.min(...leftValues)
      leftMaxValue = Math.max(...leftValues)
      leftYRange = leftMaxValue - leftMinValue || 10
      const leftPadding = Math.abs(leftYRange) * 0.2
      leftYMin = leftMinValue - leftPadding
      leftYMax = leftMaxValue + leftPadding
    }

    // Calculate data ranges for right axis
    let rightMinValue, rightMaxValue, rightYRange, rightYMin, rightYMax
    if (rightAxisLines.length > 0) {
      // Extract all right axis values
      const allRightValues = rightAxisLines.flatMap(line => line.data)
      
      // Special handling for sentiment values (index 6)
      const hasSentimentLine = rightAxisLines.some(line => line.index === 6)
      
      if (hasSentimentLine) {
        // Get sentiment values excluding zeros to find actual range
        const sentimentLine = this.lines[6]
        const visibleSentimentData = sentimentLine.data.slice(startIndex, endIndex)
        const nonZeroSentimentValues = visibleSentimentData.filter(val => val !== 0)
        
        if (nonZeroSentimentValues.length > 0) {
          // 结合所有右侧轴数据和情绪值非零数据来计算范围
          // 确保情绪值的变化能被清晰显示，同时其他线条也能正确显示
          const combinedValues = [...allRightValues, ...nonZeroSentimentValues]
          rightMinValue = Math.min(...combinedValues)
          rightMaxValue = Math.max(...combinedValues)
        } else {
          // If no non-zero sentiment values, use all right axis values
          rightMinValue = Math.min(...allRightValues)
          rightMaxValue = Math.max(...allRightValues)
        }
      } else {
        // Regular calculation for other lines
        rightMinValue = Math.min(...allRightValues)
        rightMaxValue = Math.max(...allRightValues)
      }
      
      rightYRange = rightMaxValue - rightMinValue || 10
      const rightPadding = Math.abs(rightYRange) * 0.2
      rightYMin = rightMinValue - rightPadding
      rightYMax = rightMaxValue + rightPadding
    }

    this.drawGrid(chartWidth, chartHeight, visibleDates.length)

    // Draw fill areas for right axis lines first (so they're behind left axis lines)
    for (const line of rightAxisLines) {
      if (line.index >= 2) {
        this.drawFillArea(line, chartWidth, chartHeight, rightYMin, rightYMax, visibleDates.length)
      }
    }

    // Draw fill areas for left axis lines
    for (const line of leftAxisLines) {
      if (line.index >= 2) {
        this.drawFillArea(line, chartWidth, chartHeight, leftYMin, leftYMax, visibleDates.length)
      }
    }

    // Draw right axis lines first (so they're behind left axis lines)
    for (const line of rightAxisLines) {
      this.drawLine(line, chartWidth, chartHeight, rightYMin, rightYMax, visibleDates.length)
    }

    // Draw left axis lines
    for (const line of leftAxisLines) {
      this.drawLine(line, chartWidth, chartHeight, leftYMin, leftYMax, visibleDates.length)
    }

    // Draw right axis data points first (so they're behind left axis data points)
    for (const line of rightAxisLines) {
      this.drawDataPoints(line, chartWidth, chartHeight, rightYMin, rightYMax, visibleDates.length)
    }

    // Draw left axis data points
    for (const line of leftAxisLines) {
      this.drawDataPoints(line, chartWidth, chartHeight, leftYMin, leftYMax, visibleDates.length)
    }

    this.drawAxes(chartWidth, chartHeight)
    this.drawDateLabels(chartWidth, visibleDates)
    
    // Draw Y axis labels based on which axes have visible lines
    if (leftAxisLines.length > 0) {
      this.drawYAxisLabels(chartHeight, leftYMin, leftYMax)
    }
    if (rightAxisLines.length > 0) {
      this.drawRightValueLabels(chartHeight, rightYMin, rightYMax)
    }
    
    this.drawTooltip()
    
    // Update company labels width and content to match date columns
    this.updateCompanyLabels(chartWidth, startIndex, endIndex)
  }

  drawFillArea(line, width, height, yMin, yMax, pointCount) {
    // Handle single point case to avoid division by zero
    const xStep = pointCount > 1 ? width / (pointCount - 1) : width
    const yRange = yMax - yMin

    // Extract RGB values from hex color and add transparency
    const hexToRgba = (hex, alpha) => {
      const r = Number.parseInt(hex.slice(1, 3), 16)
      const g = Number.parseInt(hex.slice(3, 5), 16)
      const b = Number.parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }

    // Calculate 0 value in chart coordinates
    const zeroY = this.canvas.height - this.chartPadding.bottom - ((0 - yMin) / yRange) * height

    // Special handling for 情绪值 line (index 6)
    if (line.index === 6) {
      // Prepare points with coordinates
      const points = line.data.map((value, i) => {
        const x = this.chartPadding.left + (i + 0.5) * xStep + this.offsetX
        const y = this.canvas.height - this.chartPadding.bottom - ((value - yMin) / yRange) * height
        return { x, y, value }
      })

      // Draw red fill for above zero
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'
      this.ctx.beginPath()
      
      // Start from first point's zeroY position
      if (points.length > 0) {
        this.ctx.moveTo(points[0].x, zeroY)
        
        // Draw data line, but clamp y to zeroY for red fill (only above zero)
        for (let i = 0; i < points.length; i++) {
          this.ctx.lineTo(points[i].x, Math.min(points[i].y, zeroY))
        }
        
        // Draw back to last point's zeroY position
        this.ctx.lineTo(points[points.length - 1].x, zeroY)
        this.ctx.closePath()
        this.ctx.fill()
      }
      
      // Draw blue fill for below zero
      this.ctx.fillStyle = 'rgba(0, 0, 255, 0.2)'
      this.ctx.beginPath()
      
      // Start from first point's zeroY position
      if (points.length > 0) {
        this.ctx.moveTo(points[0].x, zeroY)
        
        // Draw data line, but clamp y to zeroY for blue fill (only below zero)
        for (let i = 0; i < points.length; i++) {
          this.ctx.lineTo(points[i].x, Math.max(points[i].y, zeroY))
        }
        
        // Draw back to last point's zeroY position
        this.ctx.lineTo(points[points.length - 1].x, zeroY)
        this.ctx.closePath()
        this.ctx.fill()
      }
    } else {
      // Original behavior for other lines
      this.ctx.fillStyle = hexToRgba(line.color, 0.15)
      this.ctx.beginPath()
      
      // Start from bottom-left, adjust to align with the first node's position in the middle of the grid
      this.ctx.moveTo(this.chartPadding.left - 0.5 * xStep + this.offsetX, this.canvas.height - this.chartPadding.bottom)
      
      // Draw line path to top, with nodes in the middle of grid cells
      for (let i = 0; i < line.data.length; i++) {
        const x = this.chartPadding.left + (i + 0.5) * xStep + this.offsetX
        const y = this.canvas.height - this.chartPadding.bottom - ((line.data[i] - yMin) / yRange) * height
        this.ctx.lineTo(x, y)
      }
      
      // Close path back to bottom-right, adjusting to align with the last node's position
      this.ctx.lineTo(
        this.chartPadding.left + (line.data.length - 0.5) * xStep + this.offsetX,
        this.canvas.height - this.chartPadding.bottom,
      )
      this.ctx.closePath()
      this.ctx.fill()
    }
  }

  drawGrid(width, height, pointCount) {
    this.ctx.strokeStyle = "#1a1f3a"
    this.ctx.lineWidth = 1

    // Handle single point case to avoid division by zero
    const xStep = pointCount > 1 ? width / (pointCount - 1) : width
    const yStep = height / 6

    // Draw vertical grid lines
    for (let i = 0; i < pointCount; i++) {
      const x = this.chartPadding.left + i * xStep
      this.ctx.beginPath()
      this.ctx.moveTo(x, this.chartPadding.top)
      this.ctx.lineTo(x, this.canvas.height - this.chartPadding.bottom)
      this.ctx.stroke()
    }

    // Draw horizontal grid lines
    for (let i = 0; i <= 6; i++) {
      const y = this.chartPadding.top + i * yStep
      this.ctx.beginPath()
      this.ctx.moveTo(this.chartPadding.left, y)
      this.ctx.lineTo(this.canvas.width - this.chartPadding.right, y)
      this.ctx.stroke()
    }
  }

  drawAxes(width, height) {
    this.ctx.strokeStyle = "#404555"
    this.ctx.lineWidth = 1

    this.ctx.beginPath()
    this.ctx.moveTo(this.chartPadding.left, this.canvas.height - this.chartPadding.bottom)
    this.ctx.lineTo(this.canvas.width - this.chartPadding.right, this.canvas.height - this.chartPadding.bottom)
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.moveTo(this.chartPadding.left, this.chartPadding.top)
    this.ctx.lineTo(this.chartPadding.left, this.canvas.height - this.chartPadding.bottom)
    this.ctx.stroke()
  }

  drawLine(line, width, height, yMin, yMax, pointCount) {
    // Handle single point case to avoid division by zero
    const xStep = pointCount > 1 ? width / (pointCount - 1) : width
    const yRange = yMax - yMin

    this.ctx.strokeStyle = line.color
    this.ctx.lineWidth = 2

    // Set line style based on line type
    if (line.type === "dashed") {
      this.ctx.setLineDash([5, 5])
    } else {
      this.ctx.setLineDash([])
    }

    this.ctx.beginPath()

    for (let i = 0; i < line.data.length; i++) {
      // Move nodes to the middle of grid cells
      const x = this.chartPadding.left + (i + 0.5) * xStep + this.offsetX
      const y = this.canvas.height - this.chartPadding.bottom - ((line.data[i] - yMin) / yRange) * height

      if (i === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    }

    this.ctx.stroke()
    this.ctx.setLineDash([])
  }

  drawDataPoints(line, width, height, yMin, yMax, pointCount) {
    // Handle single point case to avoid division by zero
    const xStep = pointCount > 1 ? width / (pointCount - 1) : width
    const yRange = yMax - yMin

    // Increase font size for better visibility
    this.ctx.font = "bold 12px Arial"
    this.ctx.textBaseline = "middle"

    for (let i = 0; i < line.data.length; i++) {
      // Move nodes to the middle of grid cells
      const x = this.chartPadding.left + (i + 0.5) * xStep + this.offsetX
      const y = this.canvas.height - this.chartPadding.bottom - ((line.data[i] - yMin) / yRange) * height

      if (line.index === 0 || line.index === 1) {
        // 实现半透明外圈与内圈紧贴的效果
        const radius = 10
        
        // 1. 绘制半透明外圈（与内圈同圆心，稍大半径，形成紧贴效果）
        this.ctx.beginPath()
        this.ctx.arc(x, y, radius + 2, 0, Math.PI * 2) // 外圈半径比内圈大2px，紧贴内圈
        this.ctx.fillStyle = line.color.replace(")", `, 0.5)`).replace("rgb", "rgba") // 半透明效果
        this.ctx.fill()
        
        // 2. 绘制内圈主体（橙色/紫色实心圆）
        this.ctx.beginPath()
        this.ctx.arc(x, y, radius, 0, Math.PI * 2)
        this.ctx.fillStyle = line.color // 内圈使用实色
        this.ctx.fill()
        
        // 3. 绘制内圈边框
        this.ctx.strokeStyle = "#0a0e27"
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        // Draw data value text in the middle of the grid cell (same as node position now)
        this.ctx.textAlign = "center"
        this.ctx.fillStyle = "#ffffff"
        this.ctx.fillText(line.data[i], x, y)
      } else {
        // Standard node style for other lines
        this.ctx.fillStyle = line.color
        this.ctx.beginPath()
        this.ctx.arc(x, y, 4.5, 0, Math.PI * 2)
        this.ctx.fill()

        this.ctx.strokeStyle = "#0a0e27"
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        // Draw data value text in the middle of the grid cell (same as node position now)
        this.ctx.textAlign = "center"
        this.ctx.fillStyle = "#ffffff"
        this.ctx.fillText(line.data[i], x, y)
      }
    }
  }

  drawDateLabels(width, visibleDates) {
    // Handle single date case to avoid division by zero
    const xStep = visibleDates.length > 1 ? width / (visibleDates.length - 1) : width

    this.ctx.fillStyle = "#666"
    this.ctx.font = "11px Arial"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "top"

    // Format date to YYYY-MM-DD (年月日格式)
    const formatDate = (dateStr) => {
      return dateStr; // 保持完整的年月日格式
    }

    if (visibleDates.length === 1) {
      // Draw the single date label in the center
      const x = this.chartPadding.left + 0.5 * xStep + this.offsetX
      const y = this.canvas.height - this.chartPadding.bottom + 12
      this.ctx.fillText(formatDate(visibleDates[0]), x, y)
    } else {
      // Draw date labels in the middle of each grid cell
      for (let i = 0; i < visibleDates.length; i++) {
        const x = this.chartPadding.left + (i + 0.5) * xStep + this.offsetX
        const y = this.canvas.height - this.chartPadding.bottom + 12
        this.ctx.fillText(formatDate(visibleDates[i]), x, y)
      }
    }
  }

  drawYAxisLabels(height, yMin, yMax) {
    this.ctx.fillStyle = "#666"
    this.ctx.font = "10px Arial"
    this.ctx.textAlign = "right"
    this.ctx.textBaseline = "middle"

    const step = (yMax - yMin) / 6

    for (let i = 0; i <= 6; i++) {
      const value = yMax - i * step
      const y = this.chartPadding.top + i * (height / 6)
      this.ctx.fillText(Math.round(value), this.chartPadding.left - 12, y)
    }
  }

  drawRightValueLabels(height, yMin, yMax) {
    // Draw right value labels for all visible lines
    const visibleLineIndices = Array.from(this.visibleLines).filter(index => index >= 0)
    if (visibleLineIndices.length === 0) return

    this.ctx.fillStyle = "#666"
    this.ctx.font = "10px Arial"
    this.ctx.textAlign = "left"
    this.ctx.textBaseline = "middle"

    // Calculate the value range based on actual visible data
    // Use a fixed step size for consistency
    const yStep = height / 6
    const valueStep = (yMax - yMin) / 6

    for (let i = 0; i <= 6; i++) {
      // Calculate the actual value for each grid line
      const value = yMax - i * valueStep
      // Normalize the value to the chart's coordinate system
      const normalizedValue = (value - yMin) / (yMax - yMin)
      const y = this.canvas.height - this.chartPadding.bottom - normalizedValue * height
      
      // Draw a small vertical line marker
      const markerX = this.canvas.width - this.chartPadding.right
      this.ctx.strokeStyle = "#666"
      this.ctx.lineWidth = 1
      this.ctx.beginPath()
      this.ctx.moveTo(markerX, y - 3)
      this.ctx.lineTo(markerX, y + 3)
      this.ctx.stroke()
      
      // Draw the value text
      this.ctx.fillText(Math.round(value), markerX + 8, y)
    }
  }

  drawTooltip() {
    if (!this.tooltipVisible) return

    this.ctx.fillStyle = "#0a0e27"
    this.ctx.strokeStyle = "#fff"
    this.ctx.lineWidth = 1
    this.ctx.font = "12px Arial"
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"

    const { x, y, text } = this.tooltipData

    this.ctx.beginPath()
    this.ctx.roundRect(x - 50, y - 20, 100, 40, 10)
    this.ctx.fill()
    this.ctx.stroke()

    this.ctx.fillStyle = "#fff"
    this.ctx.fillText(text, x, y)
  }

  onMouseDown(e) {
    this.isMouseDown = true
    this.lastMouseX = e.clientX
    this.canvas.style.cursor = "grabbing"
  }

  onMouseMove(e) {
    if (!this.isMouseDown) return

    const currentX = e.clientX
    const deltaX = currentX - this.lastMouseX

    const maxOffset = (this.visibleDaysCount - 1) * 30
    this.offsetX += deltaX
    this.offsetX = Math.max(-maxOffset, Math.min(0, this.offsetX))

    this.lastMouseX = currentX
    this.draw()
  }

  onMouseUp(e) {
    this.isMouseDown = false
    this.canvas.style.cursor = "grab"
  }

  onTouchStart(e) {
    if (e.touches.length === 1) {
      this.isMouseDown = true
      this.lastMouseX = e.touches[0].clientX
    }
  }

  onTouchMove(e) {
    if (!this.isMouseDown || e.touches.length !== 1) return

    const currentX = e.touches[0].clientX
    const deltaX = currentX - this.lastMouseX

    const maxOffset = (this.visibleDaysCount - 1) * 30
    this.offsetX += deltaX
    this.offsetX = Math.max(-maxOffset, Math.min(0, this.offsetX))

    this.lastMouseX = currentX
    this.draw()
  }

  onTouchEnd(e) {
    this.isMouseDown = false
  }

  onDualSliderChange(sliderMin, sliderMax, sliderRange) {
    let min = Number.parseInt(sliderMin.value)
    let max = Number.parseInt(sliderMax.value)

    // Ensure max is always greater than min
    if (min >= max) {
      max = min + 1
      // Don't update slider values if they're already correct
      if (Number.parseInt(sliderMax.value) !== max) {
        sliderMax.value = max
      }
    }

    const totalDays = this.dates.length
    this.visibleDaysCount = max - min
    
    // Fix the slider logic: slider values represent the range of days to show
    // from the beginning of the data array
    // min = start position from the beginning, max = end position from the beginning
    // Example: min=5, max=20 means show days 5 to 20 from the start
    this.startIndex = min
    this.endIndex = max

    // Ensure endIndex doesn't exceed totalDays
    if (this.endIndex > totalDays) {
      this.endIndex = totalDays
      this.startIndex = Math.max(0, this.endIndex - this.visibleDaysCount)
    }

    // Ensure visibleDaysCount is at least 1
    if (this.visibleDaysCount < 1) {
      this.visibleDaysCount = 1
      this.endIndex = Math.min(totalDays, this.startIndex + 1)
    }

    const visibleDates = document.getElementById("visibleDates")
    if (this.visibleDaysCount === totalDays) {
      visibleDates.textContent = "全部"
    } else {
      visibleDates.textContent = this.visibleDaysCount + "天"
    }

    const minPercent = (min / totalDays) * 100
    const maxPercent = (max / totalDays) * 100

    sliderRange.style.left = minPercent + "%"
    sliderRange.style.right = 100 - maxPercent + "%"

    this.offsetX = 0
    this.draw()
  }

  // Slider track drag event handlers
  onSliderTrackMouseDown(e) {
    if (e.target === this.sliderTrack || e.target === this.sliderRange) {
      this.sliderIsDragging = true
      this.sliderDragStartX = e.clientX
      this.sliderInitialMin = Number.parseInt(this.sliderMin.value)
      this.sliderInitialMax = Number.parseInt(this.sliderMax.value)
      this.sliderTrack.style.cursor = "grabbing"
      
      // Prevent default to avoid text selection and conflicts
      e.preventDefault()
    }
  }

  onSliderTrackMouseMove(e) {
    if (this.sliderIsDragging) {
      const rect = this.sliderTrack.getBoundingClientRect()
      const totalWidth = rect.width
      const deltaX = e.clientX - this.sliderDragStartX
      const deltaValue = (deltaX / totalWidth) * this.dates.length
      
      let newMin = this.sliderInitialMin + deltaValue
      let newMax = this.sliderInitialMax + deltaValue
      
      // Ensure values stay within bounds
      const totalDays = this.dates.length
      if (newMin < 0) {
        const offset = -newMin
        newMin = 0
        newMax = Math.min(totalDays, this.sliderInitialMax + deltaValue + offset)
      } else if (newMax > totalDays) {
        const offset = newMax - totalDays
        newMax = totalDays
        newMin = Math.max(0, this.sliderInitialMin + deltaValue - offset)
      }
      
      // Update slider values
      this.sliderMin.value = Math.round(newMin)
      this.sliderMax.value = Math.round(newMax)
      
      // Update the chart by calling the existing dual slider change method
      this.onDualSliderChange(this.sliderMin, this.sliderMax, this.sliderRange)
      
      // Prevent default to avoid text selection
      e.preventDefault()
    }
  }

  onSliderTrackMouseUp() {
    if (this.sliderIsDragging) {
      this.sliderIsDragging = false
      this.sliderTrack.style.cursor = "pointer"
    }
  }

  onCanvasHover(e) {
    if (this.isMouseDown || this.sliderIsDragging) {
      this.hideTooltip()
      return
    }

    const rect = this.canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const chartWidth = this.canvas.width - this.chartPadding.left - this.chartPadding.right
    const chartHeight = this.canvas.height - this.chartPadding.top - this.chartPadding.bottom

    if (
      mouseX < this.chartPadding.left ||
      mouseX > this.canvas.width - this.chartPadding.right ||
      mouseY < this.chartPadding.top ||
      mouseY > this.canvas.height - this.chartPadding.bottom
    ) {
      this.hideTooltip()
      return
    }

    // Calculate visible days count based on current mode
    let visibleDaysCount, startIndex
    if (this.startIndex !== undefined && this.endIndex !== undefined) {
      // Slider mode: use the exact range specified by the slider
      visibleDaysCount = this.endIndex - this.startIndex
      startIndex = this.startIndex
    } else {
      // Default mode: show the last N days
      visibleDaysCount = this.visibleDaysCount
      startIndex = Math.max(1, this.dates.length - visibleDaysCount)
    }

    const xStep = chartWidth / (visibleDaysCount - 1)
    const relativeX = mouseX - this.chartPadding.left - this.offsetX

    // Calculate grid cell index based on mouse position
    // Each grid cell corresponds to a data point
    let cellIndex = Math.floor(relativeX / xStep)
    // Ensure cellIndex is within bounds
    cellIndex = Math.max(0, Math.min(cellIndex, visibleDaysCount - 1))

    // Use cellIndex directly as the data index within the visible range
    const dataIndex = startIndex + cellIndex

    if (dataIndex >= 0 && dataIndex < this.dates.length) {
      this.showTooltip(e, dataIndex)
    }
  }

  showTooltip(e, dataIndex) {
    const tooltip = document.getElementById("hoverTooltip")
    if (!tooltip) return

    const date = this.dates[dataIndex]
    const visibleLineIndices = Array.from(this.visibleLines).sort()

    tooltip.querySelector(".date-display").textContent = date
    const infoValues = tooltip.querySelectorAll(".info-value")
    const infoLabels = tooltip.querySelectorAll(".info-label")

    let visibleIndex = 0
    for (const lineIndex of visibleLineIndices) {
      if (visibleIndex < infoLabels.length) {
        infoLabels[visibleIndex].textContent = this.lines[lineIndex].name + "："
        infoValues[visibleIndex].textContent = this.lines[lineIndex].data[dataIndex]
        visibleIndex++
      }
    }

    // Hide extra info items
    for (let i = visibleIndex; i < infoValues.length; i++) {
      infoValues[i].parentElement.style.display = "none"
    }
    for (let i = 0; i < visibleIndex; i++) {
      infoValues[i].parentElement.style.display = "flex"
    }

    tooltip.classList.add("active")

    let tooltipX = e.clientX + 15
    let tooltipY = e.clientY + 15

    const tooltipWidth = 150
    const tooltipHeight = 100
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    if (tooltipX + tooltipWidth > viewportWidth) {
      tooltipX = e.clientX - tooltipWidth - 15
    }
    if (tooltipY + tooltipHeight > viewportHeight) {
      tooltipY = e.clientY - tooltipHeight - 15
    }

    tooltip.style.left = tooltipX + "px"
    tooltip.style.top = tooltipY + "px"
  }

  hideTooltip() {
    const tooltip = document.getElementById("hoverTooltip")
    if (tooltip) {
      tooltip.classList.remove("active")
    }
  }

  updateCompanyLabels(chartWidth, startIndex, endIndex) {
    const companyLabelsContainer = document.querySelector('.company-labels')
    if (!companyLabelsContainer) return

    // Calculate visible dates count and grid cell count
    const visibleDatesCount = endIndex - startIndex
    const gridCellCount = visibleDatesCount - 1
    
    // Calculate the width of each grid cell
    const cellWidth = gridCellCount > 0 ? chartWidth / gridCellCount : chartWidth
    const labelWidth = Math.round(cellWidth)

    // Clear the container
    companyLabelsContainer.innerHTML = ''
    
    // Ensure we have company names content
    if (this.companyNamesContent.length === 0) {
      // Fallback: get from DOM if not saved yet
      const allCompanyNames = Array.from(document.querySelectorAll('.company-name'))
      this.companyNamesContent = allCompanyNames.map(nameElement => nameElement.innerHTML)
    }
    
    // 实现数据、日期和公司名称都往左移动一列的效果
    // 方法：调整公司名称的显示范围，使公司名称与日期对应
    for (let i = startIndex; i < endIndex - 1; i++) {
      // 确保公司索引不超出范围
      const companyIndex = i
      
      if (companyIndex < this.companyNamesContent.length) {
        // Create a new element with the saved content
        const companyNameElement = document.createElement('span')
        companyNameElement.className = 'company-name'
        companyNameElement.innerHTML = this.companyNamesContent[companyIndex]
        companyNameElement.style.width = labelWidth + 'px'
        companyNameElement.style.textAlign = 'center'
        companyNameElement.style.overflow = 'hidden'
        companyNameElement.style.textOverflow = 'ellipsis'
        companyNameElement.style.whiteSpace = 'normal'
        companyNameElement.style.wordBreak = 'break-word'
        companyLabelsContainer.appendChild(companyNameElement)
      } else {
        // 如果公司名称不足，添加一个空的公司名称
        const companyNameElement = document.createElement('span')
        companyNameElement.className = 'company-name'
        companyNameElement.innerHTML = ''
        companyNameElement.style.width = labelWidth + 'px'
        companyLabelsContainer.appendChild(companyNameElement)
      }
    }

    // Set the container width to match the chart width plus padding
    const containerWidth = chartWidth + this.chartPadding.left + this.chartPadding.right
    companyLabelsContainer.style.width = containerWidth + 'px'
    companyLabelsContainer.style.display = 'flex'
    companyLabelsContainer.style.justifyContent = 'flex-start'
    companyLabelsContainer.style.alignItems = 'center'
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new StockDataChart("mainChart")
})