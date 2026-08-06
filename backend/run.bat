@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot"
if not exist "%JAVA_HOME%\bin\java.exe" (
  set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.12.8-hotspot"
)
if not exist "%JAVA_HOME%\bin\java.exe" (
  echo JAVA_HOME not found. Install JDK 21 first.
  exit /b 1
)
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo Using JAVA_HOME=%JAVA_HOME%
cd /d "%~dp0"
call mvnw.cmd spring-boot:run
