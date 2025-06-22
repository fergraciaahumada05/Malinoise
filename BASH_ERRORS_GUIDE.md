# 🔧 SOLUCIÓN DE ERRORES DE BASH - MALINOISE

## 🚨 **ERRORES COMUNES Y SOLUCIONES**

### **1. Error: "Permission denied" en setup.sh**

**Síntoma:**
```bash
bash: ./setup.sh: Permission denied
```

**Solución:**
```bash
chmod +x setup.sh
./setup.sh
```

### **2. Error: "Node.js not found" o "command not found: node"**

**Síntoma:**
```bash
bash: node: command not found
```

**Soluciones:**
1. **Instalar Node.js:**
   - Ve a: https://nodejs.org
   - Descarga la versión LTS
   - Instala y reinicia la terminal

2. **Verificar PATH:**
   ```bash
   echo $PATH
   which node
   ```

3. **Reinstalar Node.js si está instalado:**
   - Desinstalar Node.js
   - Descargar nueva versión
   - Reinstalar

### **3. Error: "Port 3000 already in use"**

**Síntoma:**
```bash
Error: listen EADDRINUSE :::3000
```

**Soluciones:**
```bash
# Opción 1: Matar procesos en puerto 3000
netstat -ano | findstr :3000
taskkill /PID [NUMERO_PID] /F

# Opción 2: Usar otro puerto
echo "PORT=3001" >> .env

# Opción 3: Matar todos los procesos Node
taskkill /IM node.exe /F
```

### **4. Error: "npm install" falla**

**Síntoma:**
```bash
npm ERR! code ENOENT
npm ERR! errno -4058
```

**Soluciones:**
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Si persiste, verificar permisos
npm config get prefix
npm config set prefix "C:\Users\[USER]\AppData\Roaming\npm"
```

### **5. Error: "Module not found" al iniciar servidor**

**Síntoma:**
```bash
Error: Cannot find module 'express'
```

**Soluciones:**
```bash
# Reinstalar dependencias específicas
npm install express cors dotenv

# O reinstalar todo
npm install

# Verificar package.json
cat package.json
```

### **6. Error: "ENOTDIR" o archivos no encontrados**

**Síntoma:**
```bash
ENOTDIR: not a directory
```

**Soluciones:**
```bash
# Verificar estructura de directorios
ls -la
pwd

# Asegurarse de estar en el directorio correcto
cd /c/Users/graci/OneDrive/Escritorio/Proyecto_Malinoise/Malinoise_web

# Crear directorios faltantes
mkdir -p public/css public/js public/assets
```

### **7. Error: Variables de entorno no cargadas**

**Síntoma:**
```bash
undefined variable en el servidor
```

**Soluciones:**
```bash
# Verificar archivo .env
cat .env

# Verificar formato (sin espacios extra)
EMAIL_USER=gracia.fernando1205@gmail.com

# No usar comillas a menos que sean necesarias
JWT_SECRET=596ee578cbeddad34d843b44444ddae25b24192fb4e123a0063fdda1e2194e0b
```

### **8. Error: "command not found: railway"**

**Síntoma:**
```bash
bash: railway: command not found
```

**Soluciones:**
```bash
# Instalar Railway CLI globalmente
npm install -g @railway/cli

# Verificar instalación
railway --version

# Si falla, usar npx
npx @railway/cli login
```

### **9. Error: Git Bash caracteres extraños**

**Síntoma:**
```bash
MINGW64 characters showing weird symbols
```

**Soluciones:**
```bash
# Configurar codificación UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Agregar al .bashrc
echo 'export LANG=en_US.UTF-8' >> ~/.bashrc
```

### **10. Error: "Failed to start server"**

**Síntoma:**
```bash
Server failed to start on port 3000
```

**Soluciones:**
```bash
# Verificar firewall
# Windows Defender -> Allow app through firewall -> Node.js

# Verificar antivirus
# Agregar excepción para la carpeta del proyecto

# Probar con otro puerto
PORT=3001 npm start
```

## 🛠️ **COMANDOS DE DIAGNÓSTICO RÁPIDO**

### **Verificación Completa:**
```bash
# Ejecutar diagnóstico automático
./diagnostico.sh

# Verificar todo manualmente
node --version
npm --version
ls -la
cat .env
npm list --depth=0
```

### **Solución de Emergencia:**
```bash
# Comando todo-en-uno para resetear el proyecto
rm -rf node_modules package-lock.json && npm cache clean --force && npm install && npm start
```

### **Verificar Estado del Servidor:**
```bash
# Probar si el servidor responde
curl -I http://localhost:3000

# Ver procesos Node.js activos
ps aux | grep node

# Ver puertos en uso
netstat -an | grep :3000
```

## 🚀 **PASOS DE SOLUCIÓN SISTEMÁTICA**

### **Cuando algo no funciona:**

1. **Verificar entorno:**
   ```bash
   node --version
   npm --version
   pwd
   ```

2. **Verificar archivos:**
   ```bash
   ls -la
   cat package.json
   cat .env
   ```

3. **Limpiar y reinstalar:**
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

4. **Probar servidor:**
   ```bash
   npm start
   ```

5. **Si falla, usar diagnóstico:**
   ```bash
   ./diagnostico.sh
   ```

## 📞 **SOPORTE**

Si ninguna solución funciona:

1. **Ejecutar diagnóstico:** `./diagnostico.sh`
2. **Copiar el resultado completo**
3. **Incluir información del sistema:**
   - SO: Windows 10/11
   - Terminal: Git Bash/PowerShell/CMD
   - Versión Node.js: `node --version`
   - Error específico que ves

## ✅ **VERIFICACIÓN FINAL**

Una vez solucionado, verificar:

```bash
# 1. Servidor funciona
npm start

# 2. Páginas cargan
curl http://localhost:3000
curl http://localhost:3000/dashboard

# 3. Sin errores en consola
# (Revisar terminal donde corre npm start)
```

---

**¡Tu aplicación Malinoise debería estar funcionando perfectamente!** 🚀
