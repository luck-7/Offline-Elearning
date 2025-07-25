@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-18.0.1
set PATH=%JAVA_HOME%\bin;%PATH%
echo Starting Spring Boot application...
apache-maven-3.8.8\bin\mvn.cmd spring-boot:run
