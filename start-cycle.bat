@echo off
setlocal enabledelayedexpansion

:: 设置环境变量
set FLASK_APP=cycle.py
set FLASK_ENV=development

echo ========================================
echo Flask Stock Cycle Application 启动脚本
echo ========================================

:: 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Python安装，请先安装Python
    pause
    exit /b 1
)

:: 检查并创建虚拟环境
if not exist venv (
    echo 创建Python虚拟环境...
    python -m venv venv
    if !errorlevel! neq 0 (
        echo 虚拟环境创建失败
        pause
        exit /b 1
    )
)

:: 激活虚拟环境
echo 激活虚拟环境...
call venv\Scripts\activate.bat

:: 升级pip
echo 升级pip...
python -m pip install --upgrade pip

:: 安装项目依赖
if exist requirements.txt (
    echo 安装项目依赖...
    pip install -r requirements.txt
) else (
    echo 未找到 requirements.txt 文件
)

:: 启动Flask应用
echo.
echo ========================================
echo 启动Flask应用: cycle.py
echo 访问地址: http://localhost:5000
echo ========================================
echo.

python cycle.py

pause
