'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { registerUser } from '@/app/services/auth/authService';
import { RegisterFormData } from '@/app/types/auth/loginFormData'
import ErrorOverlay from '@/components/ui/shared/MessageOverlay';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"


export default function RegisterPage() {
    const router = useRouter();

    // 1. ESTADOS PARA LOS DATOS DEL FORMULARIO (alineados con el payload de tu API)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [role, setRole] = useState('') // Corresponde a 'role' en el payload
    const [address, setAddress] = useState('') // Corresponde a 'address'
    const [phone, setPhone] = useState('') // Corresponde a 'phone'

    const [showError, setShowError] = useState(false); // Para mostrar el Overlay
    const [successMessage, setSuccessMessage] = useState(''); // Nuevo estado para el mensaje de éxito
    const [showSuccess, setShowSuccess] = useState(false); // Para mostrar el éxito

    // ESTADOS DE UI Y ERRORES
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Variable de conveniencia para habilitar el botón
    const camposCompletos =
        firstName.trim() !== '' &&
        lastName.trim() !== '' &&
        email.trim() !== '' &&
        password.trim() !== '' &&
        confirmPassword.trim() !== '' &&
        role.trim() !== '' &&
        address.trim() !== '' &&
        phone.trim() !== '' &&
        !loading;

    const closeNotification = () => {
        setShowError(false);
        setShowSuccess(false);
        setError('');
        setSuccessMessage('');
    };

    // 2. MANEJADOR DEL ENVÍO DEL FORMULARIO
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        closeNotification();

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setShowError(true);
            setTimeout(closeNotification, 3000);
            return;
        }

        if (!camposCompletos) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        setLoading(true);

        // Construir el payload que necesita tu backend
        const registrationPayload: RegisterFormData = {
            name: `${firstName.trim()} ${lastName.trim()}`,
            email: email.trim(),
            password: password,
            role: role as 'citizen' | 'worker', // Casteamos el string a tipo literal
            address: address.trim(),
            phone: phone.trim()
        };

        try {
            await registerUser(registrationPayload);

            setSuccessMessage('¡Registro exitoso! Serás redirigido para iniciar sesión.');
            setShowSuccess(true);

            setTimeout(() => {
                closeNotification();
                router.push('/auth/login');
            }, 3000);

        } catch (err: any) {
            // Error:
            console.error('Error durante el registro:', err.message);
            setError(err.message || 'Ocurrió un error al intentar registrar la cuenta.');
            setShowError(true);
            setTimeout(closeNotification, 3000);
        } finally {
            setLoading(false);
        }

    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-green-50 p-4">

            {/* Botón de Volver (usa useRouter para manejar la navegación) */}
            <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
                <Button variant="ghost" size="icon" onClick={() => router.push('/auth/login')} className="rounded-full">
                    <ArrowLeft className="h-6 w-6 text-[#005c2f]" />
                    <span className="sr-only">Volver</span>
                </Button>
            </div>

            {/* 4. FORMULARIO ADAPTADO A REACT Y BACKEND */}
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Crear cuenta</CardTitle>
                    <CardDescription className="text-center">Ingresa tus datos para registrarte</CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}> {/* Envolvemos el contenido en un tag <form> */}
                    <CardContent className="space-y-4">

                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nombre</Label>
                                <Input
                                    id="firstName"
                                    placeholder="Juan"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Apellido</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Pérez"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Correo electrónico */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Dirección (address) - Campo requerido por el backend */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input
                                id="address"
                                placeholder="Av. Lima 123"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        {/* Teléfono (phone) - Campo requerido por el backend */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                type="tel" // o 'text' si necesitas más flexibilidad
                                placeholder="999-888-777"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Confirmar contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {/* Tipo de usuario (role) - Solo citizen o worker */}
                        <div className="space-y-2">
                            <Label htmlFor="userType">Tipo de usuario</Label>
                            <select
                                id="userType"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="" disabled>Selecciona una opción</option>
                                <option value="citizen">Ciudadano</option>
                                <option value="worker">Municipalidad</option> {/* Cambiado de 'municipality' a 'worker' para tu API */}
                            </select>
                        </div>

                        {/* Mensaje de Error */}
                        {error && (
                            <p className="text-sm text-red-600 font-medium text-center">{error}</p>
                        )}

                        {/* Botón de Registro */}
                        <Button
                            type="submit" // Importante: type="submit" para que llame a handleSubmit
                            className="w-full bg-[#2ca05a] hover:bg-[#005c2f]"
                            disabled={!camposCompletos}
                        >
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </Button>
                    </CardContent>
                </form>

                {/* Footer */}
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-center text-sm">
                        ¿Ya tienes una cuenta?{" "}
                        {/* Aseguramos que Link use la ruta relativa de Next.js */}
                        <Link href="/auth/login" className="text-[#2ca05a] hover:underline">
                            Inicia sesión
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}