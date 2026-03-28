# FrontFisen

Proyecto Angular (standalone components) para gestión de pacientes, citas, paquetes y autenticación.

## Stack
- Angular 20
- Angular Material
- Signals + HttpClient
- SSR (`@angular/ssr`)

## Estructura modular estandarizada

```text
src/app
├── authentication/
│   ├── data-access/         # auth.service
│   ├── login/
│   └── register/
├── patients/
│   ├── data-access/         # patient.service
│   └── patient-form-dialog/
├── appointment/
│   ├── data-access/         # servicios API + store + catálogos
│   └── components/
├── package/
│   ├── data-access/         # package + package-status
│   └── package-form-dialog/
├── cie10/
│   └── data-access/
├── core/
│   ├── components/
│   ├── constants/           # routes + endpoints
│   └── models/              # ApiResponse
├── shared/
└── models/
```

## Convenciones
1. **Data Access por feature**: toda llamada HTTP y estado compartido vive en `feature/data-access`.
2. **Naming de servicios**: `*.service.ts` + clase `PascalCaseService`.
3. **Sin endpoints hardcodeados**: usar `core/constants/api.constants.ts`.
4. **Rutas centralizadas**: usar `core/constants/app-routes.constants.ts`.
5. **Contrato HTTP común**: `core/models/api-response.ts`.

## Responsive y UX
- Vistas de pacientes y citas ajustadas con breakpoints (`1024px`, `768px`, `640px`).
- Diálogos de citas con `backdrop` oscurecido para foco visual (igual criterio que pacientes).

## Scripts
```bash
npm start
npm run build
npm test
```
