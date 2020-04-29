import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

const users = [{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' }];

@Injectable()
export class HttpMockRequestInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call 
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/api/login') && method === 'POST':
                    return authenticate();
                case url.endsWith('/api/logout') && method === 'GET':
                    return logout();    
                case url.endsWith('/api/cookies') && method === 'GET':
                        return getCookie();    
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions

        function authenticate() {
            const { username, password } = body;
            const user = users.find(x => x.username === username && x.password === password);
            if (!user) return error('Username or password is incorrect');
            return ok({
                "authorization":"AAIISHIHLIHIHKUHBYBBGHGGGGUHHGHJGG"
            })
        }

        function logout() {
           
            return of(new HttpResponse({ status: 200, statusText : "ok" }))
            
        }

        function getCookie() {
            if (!isLoggedIn()) return unauthorized();
            return ok(
                [
                    {
                        "flavour":"ciaooo"
                    }
                
                ]
                
            );
        }

        function getUsers() {
            if (!isLoggedIn()) return unauthorized();
            return ok(
                {
                    "authorization":"AAIISHIHLIHIHKUHBYBBGHGGGGUHHGHJGG"
                }
            );
        }

        
        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
        }

        function error(message) {
            return throwError({ error: { message } });
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorised' } });
        }

        function isLoggedIn() {
            return true;
        }
    }
}

