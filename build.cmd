@echo off
del package\log >nul 2>&1

aps build package
