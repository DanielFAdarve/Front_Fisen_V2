# FrontFisen

Proyecto Angular (standalone components) para la gestión de pacientes, citas, paquetes y autenticación.

## Stack

- Angular 20
- Angular Material
- Signals + HttpClient
- SSR (configurado con `@angular/ssr`)

## Estructura modular recomendada

```text
src/app
├── app.config.ts
├── app.routes.ts
├── authentication/          # Login/registro/guard
├── appointment/             # Feature de citas
├── patients/                # Feature de pacientes
├── package/                 # Feature de paquetes
├── cie10/                   # Feature CIE10
├── core/
│   ├── components/          # Layout, header, sidebar
│   ├── constants/           # Rutas y endpoints centralizados
│   ├── models/              # Contratos globales (ApiResponse)
│   └── services/            # Servicios transversales
├── shared/
│   ├── animations/
│   ├── confirm-dialog/
│   ├── models/
│   └── table/
└── services/                # Servicios legacy en transición
```

## Convenciones para estandarizar desarrollo

1. **Sin endpoints hardcodeados en features**: usar `core/constants/api.constants.ts`.
2. **Rutas centralizadas**: usar `core/constants/app-routes.constants.ts`.
3. **Respuestas HTTP tipadas**: usar `core/models/api-response.ts`.
4. **Nomenclatura**:
   - Componentes: `*.component.ts` o mantener convención actual por feature (evitar mezclar en archivos nuevos).
   - Servicios: `*.service.ts` y nombre de clase alineado al archivo.
   - Modelos: `*.model.ts` por feature y `core/models` para contratos globales.
5. **Responsabilidad por capa**:
   - `core`: transversal y reutilizable.
   - `shared`: UI/UX reutilizable.
   - `feature/*`: lógica de negocio por dominio.

## Scripts

```bash
npm start
npm run build
npm test
```

## Próximos pasos de refactor (iterativo)

- Migrar `src/app/services/*` (legacy) a servicios por feature.
- Unificar naming de clases y archivos legacy (`*-data-service`).
- Mover assets de app a `src/assets` salvo casos estrictamente encapsulados.
- Introducir una capa `data-access` por feature para separar estado/UI.

## Desarrollo local

```bash
npm install
npm start
```

Abrir `http://localhost:4200/`.
