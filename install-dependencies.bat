@echo off
echo ========================================
echo Instalando dependencias do projeto...
echo ========================================
echo.

npm install @nestjs/jwt @nestjs/passport passport passport-jwt @types/passport-jwt @types/bcrypt nodemailer @types/nodemailer

echo.
echo ========================================
echo Instalacao concluida!
echo ========================================
echo.
echo Agora voce pode executar:
echo   npm run start:dev
echo.
pause
