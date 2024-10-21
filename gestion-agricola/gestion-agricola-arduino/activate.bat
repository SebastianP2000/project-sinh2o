@echo off
cd /D "%~dp0"
call venv\Scripts\activate
pip install -r requirements.txt