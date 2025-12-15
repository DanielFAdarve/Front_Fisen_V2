import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  // baseURL = 'http://localhost:3000';
  baseURL = 'https://back-fisent.onrender.com';
  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  login(event?: Event) {
    console.log("⚡ login ejecutado");
    event?.preventDefault();
    console.log("Login intentado");
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Usuario y contraseña obligatorios';
      this.cdr.detectChanges();
      return;
    }

    // console.log('Intentando iniciar sesión con', this.username, this.password);

    this.http.post(`${this.baseURL}/auth/login`, {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (resp: any) => {
        console.log('Respuesta del servidor:', resp);
        if (resp?.token) {
          localStorage.setItem('token', resp.token);
          this.router.navigate(['/patients']);
        }
      },
      error: (err) => {

        this.errorMessage = err.error?.message == "Usuario no encontrado" ? "Credenciales Invalidas" : err.error?.message;
        this.cdr.detectChanges();
      }
    });
  }
}
