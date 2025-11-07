"use client"

import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { Home, Map, Trash2, LogOut, Settings, Info, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Definimos los roles posibles para tipado
type UserRole = 'citizen' | 'worker' | null;

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  // 1. Estado para almacenar el rol del usuario
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);



  // 2. Leer el rol del usuario de localStorage al montar el componente
  useEffect(() => {
    try {
      // El rol se guarda como un string JSON, ej: '"worker"'
      const storedRole = localStorage.getItem('role');
      if (storedRole) {
        // Parseamos el string JSON (quitando las comillas si las tiene)
        const roleString = JSON.parse(storedRole).toLowerCase();

        // Aplicamos el tipo UserRole si es válido
        if (roleString === 'worker' || roleString === 'citizen') {
          setUserRole(roleString as UserRole);
        }
      }
    } catch (error) {
      console.error("Error al leer el rol de localStorage:", error);
    } finally {
      setIsLoading(false); // Terminamos la carga
    }
  }, []);

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    // 1. Elimina la cookie de sesión (Clave para el Middleware)
    Cookies.remove('access_token', { path: '/' });

    // 2. Limpia los datos de localStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("guid");

    // 3. Redirigir a login (el Middleware asegurará que permanezca allí si no hay cookie)
    router.push("/auth/login");
  }

  // Si el rol aún no se ha cargado, puedes mostrar un estado de carga o el sidebar vacío
  if (isLoading) {
    return (
      <div className="w-56 bg-green-600 text-white flex flex-col h-screen p-4">
        <p>Cargando menú...</p>
      </div>
    );
  }


  return (
    <div className="w-56 bg-green-600 text-white flex flex-col h-screen">
      {/* ... (Logo) */}
      <div className="p-4 flex items-center justify-center border-b border-green-500">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wasteTrackLogo-At4isWGBWjroCmtuzvcsTsvQdvAapf.png"
          alt="WasteTrack Logo"
          width={150}
          height={50}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {/* ENLACES COMUNES A TODOS */}
          {userRole === 'worker' && (
            <Link
              href="/c"
              className={`flex items-center px-4 py-3 text-sm ${isActive("/") ? "bg-green-700 font-medium" : "hover:bg-green-700"
                } rounded-md mx-2`}
            >
              <Home className="h-5 w-5 mr-3" />
              Inicio
            </Link>
          )}

          {/* ENLACES COMUNES (Mapa y Contenedores) */}
          <li>
            <Link
              href="/map"
              className={`flex items-center px-4 py-3 text-sm ${isActive("/map") ? "bg-green-700 font-medium" : "hover:bg-green-700"
                } rounded-md mx-2`}
            >
              <Map className="h-5 w-5 mr-3" />
              Mapa de contenedores y rutas
            </Link>
          </li>
          <li>
            <Link
              href="/containers"
              className={`flex items-center px-4 py-3 text-sm ${isActive("/containers") || pathname.startsWith("/containers/")
                ? "bg-green-700 font-medium"
                : "hover:bg-green-700"
                } rounded-md mx-2`}
            >
              <Trash2 className="h-5 w-5 mr-3" />
              Contenedores
            </Link>
          </li>

          {/* ... (Otros enlaces comunes) */}
          {userRole === 'worker' && (
          <li>
            <Link
              href="/settings"
              className={`flex items-center px-4 py-3 text-sm ${isActive("/settings") ? "bg-green-700 font-medium" : "hover:bg-green-700"
                } rounded-md mx-2`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Ajustes
            </Link>
          </li>)}
          <li>
            <Link
              href="/about"
              className={`flex items-center px-4 py-3 text-sm ${isActive("/about") ? "bg-green-700 font-medium" : "hover:bg-green-700"
                } rounded-md mx-2`}
            >
              <Info className="h-5 w-5 mr-3" />
              Acerca de nosotros
            </Link>
          </li>
        </ul>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-green-500">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm hover:bg-green-700 rounded-md"
        >
          <Avatar className="h-8 w-8 mr-3 bg-green-800">
            {/* Puedes intentar mostrar la inicial del usuario si la tienes */}
            <AvatarFallback>{userRole ? userRole[0].toUpperCase() : '?'}</AvatarFallback>
          </Avatar>
          <span>Cerrar sesión</span>
          <LogOut className="h-4 w-4 ml-auto" />
        </button>
      </div>
    </div>
  )
}