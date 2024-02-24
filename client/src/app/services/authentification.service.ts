import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@common/user';
import { delay, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthentificationService {
  isLogged: boolean = false;
  username: string = '';
  private readonly baseUrl: string = 'http://ec2-18-116-81-58.us-east-2.compute.amazonaws.com:3000/api/fs/players';
  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  setUsername(username: string) {
    this.username = username;
  }

  validateUserLogin(user: User) {
    return this.http.post(`${this.baseUrl}/login`, user, {
      observe: 'response',
      responseType: 'json',
    });
  }

  login() {
    return of(true).pipe(
      delay(500),
      tap(() => (this.isLogged = true)),
    );
  }

  validateUserSignUp(user: User) {
    return this.http.post(`${this.baseUrl}/new`, user, {
      observe: 'response',
      responseType: 'json',
    });
  }

  logout() {
    const url = `${this.baseUrl}/${this.username}/logout`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);

    this.http.patch(url, {}, { headers }).subscribe({
      next: () => {
        localStorage.clear();
        this.isLogged = false;
        this.router.navigate(['login']);
      },
      error: (error) => console.error('Logout failed', error),
    });
  }
}
