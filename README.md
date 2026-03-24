# My Lexicon – Gestión de Diccionarios Personales


**My Lexicon** es una aplicación web que permite a los usuarios crear, organizar y gestionar diccionarios personales de manera eficiente para así recopilar términos y expresiones aprendidas en distintos idiomas. La aplicación está diseñada para ser segura, escalable y con una experiencia de usuario fluida, adaptable a dispositivos de escritorio y móviles.

Url Desplegada: https://mylexicon.onrender.com/
---

## Características Principales

- Registro y autenticación segura mediante tokens JWT.  
- Gestión de perfil de usuario.  
- Gestión de diccionarios y sus entradas.  
- Sistema de filtrado de entradas para fácil agrupación y acceso a revisar términos.
- Interfaz responsive y modular, adaptable a distintos dispositivos.  
- Validación de datos en backend para garantizar consistencia.  
- Control de acceso mediante roles de usuario.  
- Optimización para rendimiento y escalabilidad.
- Contraseñas encriptadas en base de datos.
- Sistema de pruebas automatizadas con cobertura superior al 90% y generador automático de datos de prueba.
---

## Arquitectura de la Aplicación

### Frontend
- Framework SPA React + Vite.  
- Manejo de estado global para autenticación y datos de usuario.  
- Comunicación con backend a través de HTTP con cabeceras de autorización.  
- Diseño modular basado en componentes responsive.  

### Backend
- Framework de servidorNestJS.  
- Base de datos relacional con ORM TypeORM de NEST. 
- Autenticación mediante JWT con expiración configurable.  
- Validación de datos y control de errores centralizado con Zod usando DTOs.  
- Documentación de API mediante Swagger.  

### Base de Datos
- Relacional PostgreSQL.  
- Tablas principales: `user`, `dictionary`, `entry`.  
- Relaciones:  
  - Un usuario puede tener múltiples diccionarios.  
  - Un diccionario puede tener múltiples entradas.

---

## Instalación

### Requisitos previos
- Node.js y npm.  
- Base de datos relacional (PostgreSQL).  

### Backend ( NEST )

#### Configuración de variables de entorno

Crea un archivo `.env` en el directorio `src/backend` con las siguientes variables:

```env
# ========================= Database Configuration =========================
DB_HOST=localhost          # Host del servidor de base de datos (usa localhost para desarrollo local)
DB_PORT=5432               # Puerto de la base de datos (PostgreSQL por defecto: 5432)
DB_USERNAME=postgres       # Usuario de la base de datos
DB_PASSWORD=password       # Contraseña del usuario
DB_NAME=mylexicondb        # Nombre del esquema o base de datos a usar

# ========================= Authentication - JWT Configuration =========================
JWT_SECRET=supersecret     # Clave secreta para firmar y verificar tokens JWT (mantener privada y segura en producción)
JWT_EXPIRES_IN=1h          # Tiempo de expiración del token (ej: 1h, 2d, 30m)
BCRYPT_SALT=10             # Número de rondas de salt para bcrypt (mayor valor = mayor seguridad y tiempo de hash)

# ========================= CORS - Frontend & API URL =========================
DEPLOY=false               # Indica si se está usando el despliegue en producción true/false
FRONTEND_URL_LOCAL=http://localhost:5173
FRONTEND_URL_DEPLOY=https://myapp.com
BACKEND_URL_LOCAL=http://localhost:3000
BACKEND_URL_DEPLOY=https://api.server.com
```
Una vez listo , escribiremos: 
 1) cd src/backend
 2) npm install
 3) npm run start

### Frontend ( REACT + VITE )

#### Configuración de variables de entorno

Crea un archivo `.env` en el directorio `src/frontend` con las siguientes variables:

```env
VITE_DEPLOY=false
VITE_API_URL_LOCAL=http://localhost:3000
VITE_API_URL_DEPLOY=http://213.194.133.234:3000
```
Una vez listo , escribiremos: 
 1) cd src/frontend
 2) npm install
 3) npm run dev
