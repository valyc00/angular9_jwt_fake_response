import { Injectable } from '@angular/core';

import { TokenService } from './token.service'
import { Credentials } from '../credentials';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  static readonly TOKEN_STORAGE_KEY = 'token';
  redirectToUrl: string = '/cookies';
  redirectToLogin: string = '/login';

  constructor(private router: Router, private tokenService: TokenService) { }

  public login(credentials: Credentials): void {
    this.tokenService.getResponseHeaders(credentials)
    .subscribe((res: HttpResponse<any>) => {
      //this.saveToken(res.headers.get('authorization'));
      this.saveToken(res.body.authorization);
      this.router.navigate([this.redirectToUrl]);
    });
  }

  private saveToken(token: string){
    sessionStorage.setItem(AuthService.TOKEN_STORAGE_KEY, token);
  }

  public getToken(): string {
    return sessionStorage.getItem(AuthService.TOKEN_STORAGE_KEY);
  }

  public logout(): void {
    this.tokenService.logout()
    .subscribe(() =>{
      console.log("logout!!!!");
      sessionStorage.removeItem(AuthService.TOKEN_STORAGE_KEY);
      //this.router.navigate([this.redirectToLogin]);
    });
  }

  public isLoggedIn(): boolean {
    var token = this.getToken();
    if(token==null){
      return false;
    }
    else
    {
      return true;
    }
  }
}
