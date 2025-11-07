import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Define las rutas públicas (no requieren login)
const PUBLIC_FILE = /\.(.*)$/; // Para evitar escanear archivos estáticos como imágenes
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

// 2. Define las rutas que SÍ requieren login
const PROTECTED_ROUTES = ['/', '/containers', '/map', '/settings', '/management']; // Añade todas tus rutas protegidas

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Omitir Middleware para archivos estáticos y la propia API de Next.js
    if (pathname.includes('/api/') || PUBLIC_FILE.test(pathname)) {
        return NextResponse.next();
    }

    // 3. Verificar el token de sesión (cookie)
    // Asumes que la cookie 'access_token' indica que el usuario está logeado.
    const accessToken = request.cookies.get('access_token');
    const isPublicRoute = AUTH_ROUTES.includes(pathname);
    const isProtectedRoute = PROTECTED_ROUTES.includes(pathname);
    
    // --- Lógica de Protección ---

    if (isProtectedRoute && !accessToken) {
        // Si intenta acceder a una ruta protegida y NO tiene token, redirigir a Login.
        const loginUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    if (isPublicRoute && accessToken) {
        // Si intenta acceder a Login/Register pero YA tiene token, redirigir a la Home.
        const homeUrl = new URL('/containers', request.url); // Redirige a /containers como tu home de post-login
        return NextResponse.redirect(homeUrl);
    }

    // Continuar con la solicitud (permitir el acceso a la ruta)
    return NextResponse.next();
}

// 4. Configuración: Especifica qué rutas debe interceptar el Middleware
export const config = {
    // Intercepta todas las rutas excepto las que contienen '.', '_next' (internas) o 'api'
    matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'], 
};