# 🎖️ Sistema de Kardex Digital con Blockchain - EMI
## Escuela Militar de Ingeniería

Sistema web completo para la gestión académica con tecnología Blockchain que garantiza la **inmutabilidad** e **integridad** de los registros académicos.

---

## 🏗️ Arquitectura del Sistema

```
React (Frontend:5173) ←→ Node.js (Blockchain:3001) ←→ Django (API:8000) ←→ PostgreSQL
```

---

## ⚡ Inicio Rápido

### 1. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 2. Backend Blockchain (Node.js)
```bash
cd backend-node
npm install
npm run dev
# → http://localhost:3001
```

### 3. Backend Core (Django)
```bash
cd backend-django
# Instalar Python 3.11+ primero desde python.org
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
# → http://localhost:8000
```

### 4. Base de Datos (PostgreSQL)
1. Abrir pgAdmin4
2. Crear base de datos: `emi_kardex_db`
3. Ejecutar script: `backend-django/schema.sql`
4. Configurar en `.env`: `DB_PASSWORD=12345`

---

## 👤 Credenciales de Acceso (Demo)

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin123` | Administrador |
| `docente1` | `doc123` | Docente |
| `estudiante1` | `est123` | Estudiante |

---

## 🧩 Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| 🔐 **Login** | Autenticación JWT con roles |
| 📊 **Dashboard** | KPIs, gráficas, estado blockchain |
| 📚 **Kardex** | Historial académico verificado en blockchain |
| ⛓️ **Blockchain Explorer** | Visualizador de cadena de bloques SHA-256 |
| 📄 **Certificados** | Emisión y verificación con hash |
| 🎓 **Estudiantes** | CRUD con grados militares |
| 👥 **Docentes** | Gestión del cuerpo docente |
| 📖 **Materias** | Plan de estudios por carrera |
| 📅 **Gestiones** | Semestres académicos |
| 📈 **Reportes** | Estadísticas y análisis |
| 🛡️ **Auditoría** | Log de operaciones con blockchain |

---

## ⛓️ Tecnología Blockchain

- **Algoritmo**: SHA-256 (implementado en Node.js)
- **Estructura**: Linked blocks con hash previo
- **Inmutabilidad**: Cualquier modificación invalida la cadena
- **Verificación**: API REST para verificar cualquier hash
- **Proof of Work**: Dificultad configurable

---

## 🗄️ Base de Datos

- **Motor**: PostgreSQL
- **Nombre**: `emi_kardex_db`
- **Puerto**: 5432
- **Usuario**: postgres
- **Contraseña**: 12345

---

## 📁 Estructura del Proyecto

```
sistema-webv/
├── frontend/          # React 18 + Vite + Zustand
├── backend-node/      # Node.js + Express (Blockchain)
└── backend-django/    # Django 4.2 + DRF (Core)
    └── schema.sql     # Script PostgreSQL completo
```
