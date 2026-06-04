# DevSu Banco Products Frontend

Frontend Angular para la prueba técnica de DevSu. La app gestiona productos financieros desde la API local de Banco.

## Requisitos

- Node.js compatible con Angular 21
- npm
- Backend local funcionando en `http://localhost:3002`

## Instalación

```bash
npm install
```

## Ejecución

Inicia primero el backend y luego ejecuta:

```bash
npm run start
```

Abre `http://localhost:4200`.

## Validación

```bash
npm run build
npm run lint
npm run format:check
npm run test:coverage
```

Los umbrales de cobertura están configurados en 70% para sentencias, ramas, funciones y líneas.

## Funcionalidades

- Listado de productos desde `/bp/products`
- Búsqueda por nombre o descripción del producto
- Conteo de resultados, selector de tamaño de página y paginación simple
- Creación de productos con validación de campos y verificación de ID
- Edición de productos con el ID bloqueado
- Eliminación de productos con modal de confirmación
