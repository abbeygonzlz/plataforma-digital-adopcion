# Adopaws Frontend

SPA React para la plataforma de adopción de mascotas Adopaws.

## Stack

- **React 18** + **Vite**
- **React Router v6** (SPA routing)
- **Axios** (HTTP client con interceptores JWT)
- **CSS Modules** (estilos con design system de tokens CSS)

## Estructura

```
src/
├── App.jsx                    # Routing raíz
├── main.jsx                   # Entry point
├── index.css                  # Design system (CSS variables globales)
│
├── context/
│   └── AuthContext.jsx        # Estado global de autenticación (JWT)
│
├── services/
│   └── api.js                 # Capa de servicios HTTP (axios + interceptores)
│
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx # HOC para rutas protegidas
│   ├── layout/
│   │   ├── Layout.jsx         # Layout raíz (Navbar + Outlet + Footer)
│   │   ├── Navbar.jsx         # Navbar responsiva con menú de usuario
│   │   └── Footer.jsx         # Footer con links y redes sociales
│   ├── pets/
│   │   └── PetCard.jsx        # Tarjeta de mascota reutilizable
│   └── ui/
│       └── Button.jsx         # Botón con variantes (primary, secondary, ghost, accent)
│
└── pages/
    ├── Home.jsx               # Landing page con hero, featured pets, pasos
    ├── Pets.jsx               # Listado con filtros sidebar (especie, edad, tamaño, género)
    ├── PetDetail.jsx          # Detalle de mascota + solicitud de adopción
    ├── Login.jsx              # Login con JWT
    ├── Register.jsx           # Registro (adoptante / refugio)
    ├── Profile.jsx            # Perfil de usuario (protegida)
    ├── MyApplications.jsx     # Mis solicitudes de adopción (protegida)
    ├── Favorites.jsx          # Mascotas favoritas (protegida)
    ├── Shelters.jsx           # Listado de refugios
    ├── ShelterDetail.jsx      # Detalle de refugio + sus mascotas
    ├── HowItWorks.jsx         # Cómo funciona la plataforma
    ├── Dashboard.jsx          # Panel para refugios (protegida, rol: shelter)
    └── NotFound.jsx           # 404
```

## Instalación

```bash
cd adopaws-frontend
cp .env.example .env           # Configura la URL del API
npm install
npm run dev                    # http://localhost:5173
```

## Integración con el backend

El frontend espera que el API (.NET) esté en la URL configurada en `.env`.

### Endpoints esperados

| Servicio | Endpoint |
|---------|----------|
| Login | `POST /api/auth/login` → `{ token, user }` |
| Registro | `POST /api/auth/register` → `{ token, user }` |
| Mascotas | `GET /api/pets?page&pageSize&species&search...` |
| Mascota | `GET /api/pets/:id` |
| Solicitud | `POST /api/adoptions` |
| Refugios | `GET /api/shelters` |
| Favoritos | `GET/POST/DELETE /api/users/favorites` |

El token JWT se almacena en `localStorage` y se adjunta automáticamente a cada request via interceptor de axios.

## Roles

- `adopter` — Puede explorar, guardar favoritos, y enviar solicitudes
- `shelter` — Todo lo anterior + acceso al `/dashboard` para gestionar sus mascotas

## Build para producción

```bash
npm run build                  # Genera /dist
npm run preview                # Preview del build
```
## Pruebas Unitarias

Las pruebas cubren la capa de servicios HTTP (`src/services/api.js`) utilizando **Vitest** como framework de pruebas y **axios-mock-adapter** para simular las respuestas del backend sin necesitar tenerlo encendido.

### Librerías instaladas

| Librería | Uso |
|---|---|
| `vitest` | Framework de pruebas para JavaScript |
| `@vitest/coverage-v8` | Generación de reporte de cobertura |
| `axios-mock-adapter` | Simulación de respuestas HTTP |

### Archivos de prueba

| Archivo | Pruebas | Descripción |
|---|---|---|
| `userService.test.js` | 10 | CRUD completo de usuarios |
| `petService.test.js` | 10 | CRUD completo de mascotas |
| `marketplaceService.test.js` | 10 | CRUD completo de marketplace |
| `authService.test.js` | 6 | Login y registro de usuarios |
| `adoptionService.test.js` | 11 | Solicitudes de adopción |
| `consultationService.test.js` | 13 | Consultas y respuestas |
| **Total** | **60** | |

### Correr las pruebas
```bash
# Correr todas las pruebas
npm test

# Generar reporte de cobertura
npm run coverage
```

### Resultados
```
Test Files  6 passed (6)
Tests       60 passed (60)
Coverage    72.72% (supera el mínimo requerido del 70%)
```

### Reporte de cobertura

El reporte HTML se genera automáticamente en la carpeta `coverage/` al correr `npm run coverage`. 
Abrí `coverage/index.html` en el navegador para ver el detalle visual de las líneas cubiertas.

### Actualización - Pruebas adicionales

Se agregaron pruebas para cubrir el resto de servicios del frontend y alcanzar el mínimo de cobertura del 70%:

| Archivo | Pruebas | Qué cubre |
|---|---|---|
| `authService.test.js` | 6 | Login, registro y manejo de email duplicado |
| `adoptionService.test.js` | 11 | CRUD completo de solicitudes de adopción |
| `consultationService.test.js` | 13 | CRUD completo de consultas y respuestas |
| **Total actualizado** | **60** | |

### Cobertura final
```
Test Files  6 passed (6)
Tests       60 passed (60)
Coverage    72.72% (supera el mínimo requerido del 70%)
```

### Correr pruebas individuales
```bash
# Pruebas de autenticación (incluye manejo de duplicados)
npx vitest run src/__tests__/authService.test.js

# Pruebas de adopciones
npx vitest run src/__tests__/adoptionService.test.js

# Pruebas de consultas
npx vitest run src/__tests__/consultationService.test.js
```