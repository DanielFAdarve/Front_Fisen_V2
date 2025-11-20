import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);

  // 🛡️ Evita error en SSR
  const isBrowser = typeof window !== 'undefined';

  let token = null;

  if (isBrowser) {
    token = localStorage.getItem('token');
  }

  // Si no hay token → redirige a login
  if (!token) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
