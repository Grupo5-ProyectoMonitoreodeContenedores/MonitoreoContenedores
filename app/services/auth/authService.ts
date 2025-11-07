
import { LoginFormData, RegisterFormData } from '@/app/types/auth/loginFormData';
import { fetchWithAuth } from '@/app/utils/fetchWithAuth';

export async function loginUser(data: LoginFormData): Promise<any> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  return json;
}

export async function registerUser(data: RegisterFormData): Promise<any> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Aquí enviamos el payload completo que requiere el backend
        body: JSON.stringify(data), 
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'El registro falló debido a un error del servidor.');
    }
    
    const json = await res.json();
    return json;
}