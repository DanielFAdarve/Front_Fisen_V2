export interface MenuItem {
  id?: string;
  label: string;
  icon?: string;                 // ej. 'fas fa-users'
  route?: string;                // ruta interna o url externa
  external?: boolean;            // si true → <a href=... target=...>
  target?: '_blank' | '_self';
  badge?: { text: string; color?: string }; // contador / status
  roles?: string[];              // roles permitidos (filtrado en runtime)
  permissions?: string[];        // permisos finos
  tooltip?: string;
  shortcut?: string;             // ej. 'Alt+P'
  disabled?: boolean;
  children?: MenuItem[];
}
