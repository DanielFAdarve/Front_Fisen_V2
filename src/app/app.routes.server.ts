import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // renderMode: RenderMode.Prerender
    renderMode: RenderMode.Client
  },
  {
    path: 'historias-clinicas/:idCita',
    renderMode: RenderMode.Client // 👈 LA CLAVE
  }
];
