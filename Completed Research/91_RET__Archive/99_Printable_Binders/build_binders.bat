@echo off
REM Build Script for 99_Printable_Binders
REM This script runs the Node.js converter to generate the print-ready HTML file.

cd "C:\Rental Docs\99_Printable_Binders"
echo Generating Print-Ready HTML File...
node generate_pdfs.js
echo.
echo Process Complete! 
echo Please open "C:\Rental Docs\99_Printable_Binders\Printable_Binders_Master.html" in Chrome or Edge.
echo Press Ctrl+P, select "Save as PDF", and ensure "Background graphics" is checked in More Settings.
pause