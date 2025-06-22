# 🗄️ Guía de Administración de Base de Datos - PreverIA

## 📊 Descripción General

PreverIA actualmente utiliza **localStorage** del navegador como sistema de persistencia de datos. Esto simula una base de datos local que mantiene toda la información de la aplicación de forma persistente entre sesiones.

## 🎯 Acceso al Administrador de Base de Datos

### Opciones de Acceso

1. **Desde el Dashboard**: Botón "🗄️ DB Admin" en la cabecera
2. **URL Directa**: `http://localhost:3000/database-admin.html`
3. **Navegación**: Desde cualquier página con el botón correspondiente

## 🗂️ Estructura de Datos

### 👤 **Datos de Usuario** (`localStorage keys`)
```json
{
  "isLoggedIn": "true|false",           // Estado de autenticación
  "userEmail": "usuario@email.com",     // Email del usuario
  "userName": "usuario",                // Nombre extraído del email
  "registrationDate": "2025-06-22T...", // Fecha de registro (ISO)
  "lastLoginDate": "2025-06-22T...",    // Último acceso (ISO)
  "loginMethod": "login|register"       // Método de autenticación
}
```

### 💰 **Datos de Ventas** (`simulatedSales`, `simulatedTotalSales`, `simulatedNetProfit`)
```json
{
  "totalSales": "5000.00",              // Ventas totales acumuladas
  "netProfit": "1500.00",               // Ganancia neta total
  "salesHistory": [                     // Historial de ventas
    {
      "product": "Producto A",
      "quantity": 5,
      "price": 50.00,
      "date": "2025-06-15"
    }
  ]
}
```

### 📦 **Inventario de Productos** (`simulatedProducts`)
```json
[
  {
    "id": "P001",                       // ID único del producto
    "name": "Producto A",               // Nombre del producto
    "sku": "SKU001",                    // Código SKU único
    "stock": 95,                        // Cantidad en stock (-1 para servicios)
    "price": 50.00                      // Precio de venta
  }
]
```

### 🏢 **Configuración de Negocio** (`currentBusiness`)
```json
{
  "name": "Mi Negocio",                 // Nombre del negocio
  "initialInvestment": 0,               // Inversión inicial calculada
  "monthlyExpenses": 1500,              // Gastos mensuales
  "monthlyRevenue": 2000                // Ingresos mensuales estimados
}
```

### 💸 **Gastos de Inversión** (`initialExpenses`)
```json
[
  {
    "name": "Licencias de Software",    // Descripción del gasto
    "amount": 500                       // Monto del gasto
  }
]
```

## 🛠️ Funcionalidades del Administrador

### 🎛️ **Panel de Control**
- **🔄 Actualizar Datos**: Refresca toda la información mostrada
- **📥 Exportar Todo**: Descarga un backup completo en JSON
- **📤 Importar Datos**: Restaura datos desde un archivo JSON
- **🗑️ Limpiar Todo**: Elimina todos los datos (⚠️ irreversible)

### ✏️ **Edición de Datos**
Cada sección permite:
- **Visualización**: JSON formateado y legible
- **Edición Manual**: Modificar datos directamente en JSON
- **Limpieza Selectiva**: Eliminar datos específicos
- **Adición de Ejemplos**: Generar datos de prueba

### 📊 **Estadísticas en Tiempo Real**
- Total de ventas acumuladas
- Número de transacciones
- Cantidad de productos en inventario
- Stock total disponible

## 🔧 Operaciones Comunes

### ➕ **Agregar Datos de Ejemplo**
```javascript
// Añadir venta de ejemplo
addSampleSale();

// Añadir producto de ejemplo
addSampleProduct();

// Añadir gasto de inversión
addSampleExpense();
```

### 🗑️ **Limpiar Datos Específicos**
```javascript
// Limpiar solo datos de usuario (cierra sesión)
clearUserData();

// Limpiar solo ventas
clearSalesData();

// Limpiar solo productos
clearProductsData();

// Restaurar productos por defecto
resetDefaultProducts();
```

### 💾 **Backup y Restauración**
```javascript
// Exportar todos los datos
exportData(); // Descarga archivo JSON

// Importar datos desde archivo
importData(); // Selecciona archivo JSON
```

## 🔒 Seguridad y Consideraciones

### ⚠️ **Limitaciones de localStorage**
- **Tamaño**: Limitado a ~5-10MB por dominio
- **Persistencia**: Solo en el navegador local
- **Seguridad**: No encriptado, visible en DevTools
- **Alcance**: Solo accesible desde el mismo dominio

### 🛡️ **Buenas Prácticas**
1. **Backup Regular**: Exporta datos importantes
2. **Validación**: Verifica JSON antes de importar
3. **Limpieza**: Elimina datos innecesarios periódicamente
4. **Monitoreo**: Revisa el tamaño de datos almacenados

## 🔄 Migración a Base de Datos Real

### 📈 **Próximas Mejoras**
Para un entorno de producción, se recomienda migrar a:

1. **Firebase Firestore**
   ```javascript
   // Estructura similar pero en la nube
   firebase.firestore().collection('users').doc(userId)
   ```

2. **MongoDB + Express API**
   ```javascript
   // API REST para operaciones CRUD
   POST /api/users
   GET /api/sales
   PUT /api/products/:id
   ```

3. **PostgreSQL + Prisma**
   ```sql
   -- Esquema SQL estructurado
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email VARCHAR(255) UNIQUE,
     created_at TIMESTAMP
   );
   ```

### 🔄 **Script de Migración**
```javascript
// Función para migrar datos de localStorage a API
async function migrateToDatabase() {
  const localData = exportLocalStorageData();
  const response = await fetch('/api/migrate', {
    method: 'POST',
    body: JSON.stringify(localData),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}
```

## 🐛 Solución de Problemas

### ❌ **Problemas Comunes**

1. **Datos no se guardan**
   - Verificar que localStorage esté habilitado
   - Comprobar límites de almacenamiento
   - Revisar errores en la consola

2. **JSON inválido al editar**
   - Usar un validador JSON online
   - Verificar comillas y comas
   - Respetar la estructura existente

3. **Datos perdidos**
   - Comprobar si hay backups automáticos
   - Verificar que no se haya limpiado el navegador
   - Restaurar desde archivo de exportación

### 🔍 **Herramientas de Debugging**
```javascript
// Inspeccionar localStorage en DevTools
console.log(localStorage);

// Verificar tamaño de datos
JSON.stringify(localStorage).length;

// Listar todas las claves
Object.keys(localStorage);
```

## 📱 Acceso desde Diferentes Dispositivos

### 🔄 **Sincronización Manual**

1. **Exportar** datos del dispositivo origen
2. **Transferir** archivo JSON al dispositivo destino
3. **Importar** datos en el dispositivo destino

### ☁️ **Solución Futura**: Sincronización en la Nube

- Autenticación centralizada
- Datos sincronizados en tiempo real
- Acceso desde cualquier dispositivo
- Backup automático

---

**Nota**: Esta guía cubre el sistema actual de localStorage. Para un entorno de producción, se recomienda implementar una base de datos real con autenticación y sincronización en la nube.
