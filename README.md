<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Proyecto Examen

API REST construida con [NestJS](https://nestjs.com/), autenticación mediante **JSON Web Tokens (JWT)** y protección de rutas con **Guards**.

---


## 1. Instalación

Clona el repositorio e instala los paquetes necesarios:

```bash
git clone https://github.com/ricknes100/INF781-3PARCIAL-YUCRA
cd INF781-3PARCIAL-YUCRA
npm install
```

---

## 2. Configuración del archivo `.env`

Crea un archivo `.env` en la raíz del proyecto basándote en el archivo de ejemplo:

```bash
cp .env.example .env
```

Luego edita el archivo `.env` con tus propios valores:

```env
APP_PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=nombre_base_de_datos

JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=tu_clave_refresh_secreta
JWT_REFRESH_EXPIRES_IN=7d
```
---

## 3. Configuración de la base de datos

### Crear la base de datos

Conéctate a PostgreSQL y crea la base de datos:

```sql
CREATE DATABASE nombre_base_de_datos;
```
## 4. Arranque del servidor

```bash
npm run start:dev
```