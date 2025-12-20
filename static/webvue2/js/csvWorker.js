// CSV解析Web Worker - 增强版，支持引号和转义字符
self.onmessage = function(e) {
  const csvText = e.data;
  
  try {
    // 处理BOM头
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
    }
    
    // 处理换行符，确保所有换行符都是\n
    csvText = csvText.replace(/\r\n/g, '\n');
    csvText = csvText.replace(/\r/g, '\n');
    
    // 解析CSV数据
    const parsedData = parseCSV(csvText);
    
    if (parsedData.length < 1) {
      self.postMessage({ success: false, error: 'CSV数据为空' });
      return;
    }
    
    // 返回处理后的数据
    self.postMessage({ success: true, data: parsedData });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};

// 增强的CSV解析函数，支持引号和转义字符
function parseCSV(csvText) {
  const result = [];
  
  let currentField = '';
  let currentRow = [];
  let inQuotes = false;
  
  // 逐字符处理
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    // 处理引号
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 处理转义引号
        currentField += '"';
        i++; // 跳过下一个引号
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
      continue;
    }
    
    // 处理逗号分隔符，仅当不在引号中时
    if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
      continue;
    }
    
    // 处理换行符，仅当不在引号中时
    if ((char === '\n' || char === '\r') && !inQuotes) {
      // 保存当前字段
      if (currentField.trim() !== '' || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        
        // 添加到结果
        if (currentRow.length > 0) {
          result.push(currentRow);
        }
        
        // 重置
        currentRow = [];
        currentField = '';
      }
      continue;
    }
    
    // 处理普通字符
    currentField += char;
  }
  
  // 处理最后一行
  if (currentField.trim() !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.length > 0) {
      result.push(currentRow);
    }
  }
  
  // 跳过表头，返回数据行
  return result.slice(1);
}