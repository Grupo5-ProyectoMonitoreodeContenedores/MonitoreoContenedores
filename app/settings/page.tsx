"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, User, Mail, Phone, Calendar, Globe, Languages, MapPin, UserPlus, FileText } from "lucide-react"
import Sidebar from "@/components/sidebar"

type UserRole = 'citizen' | 'worker' | null;

export default function SettingsPage() {
  const router = useRouter()

  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Inicializamos el estado de userInfo vacío
  // Se llenará desde localStorage en el useEffect
  const [userInfo, setUserInfo] = useState({
    displayName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    languages: "",
    address: "",
    emergencyContact: "",
  })

  // 2. useEffect para cargar TODOS los datos del localStorage
  useEffect(() => {
    try {
      // --- Cargar Rol ---
      const storedRole = localStorage.getItem('role');
      if (storedRole) {
        // Usamos tu lógica original (asumiendo que el rol se guarda como JSON string)
        const roleString = JSON.parse(storedRole).toLowerCase();
        if (roleString === 'worker' || roleString === 'citizen') {
          setUserRole(roleString as UserRole);
        }
      }

      // --- Cargar Información del Usuario ---
      // Asumimos que estos datos se guardan como strings normales.
      // ¡Asegúrate de que las claves ('displayName', 'email', etc.) 
      // coincidan con las que usas al guardar en el login!

      // Usamos '|| ""' como fallback para evitar que el valor sea 'null'
      // si el item no existe en localStorage.
      setUserInfo({
        displayName: localStorage.getItem('displayName') || "",
        email: localStorage.getItem('email') || "",
        phone: localStorage.getItem('phone') || "",
        dateOfBirth: localStorage.getItem('dateOfBirth') || "",
        nationality: localStorage.getItem('nationality') || "",
        languages: localStorage.getItem('languages') || "",
        address: localStorage.getItem('address') || "",
        emergencyContact: localStorage.getItem('emergencyContact') || "",
      });

    } catch (error) {
      console.error("Error al leer datos de localStorage:", error);
      // Opcional: Redirigir a login si los datos están corruptos
      // router.push("/auth/login");
    } finally {
      setIsLoading(false); // Terminamos la carga
    }
  }, []); // El array vacío asegura que se ejecute solo una vez al montar


  // 3. El handler para cambios en los inputs
  const handleChange = (field: string, value: string) => {
    setUserInfo({
      ...userInfo,
      [field]: value,
    })
  }

  // 4. El handler para guardar, ahora actualizado
  const handleSave = () => {
    // Aquí iría la lógica para guardar en la API/Base de Datos...
    // fetch('/api/user/update', { method: 'POST', body: JSON.stringify(userInfo) })

    // Y LUEGO, actualizamos el localStorage con los nuevos datos
    try {
      localStorage.setItem('displayName', userInfo.displayName);
      localStorage.setItem('email', userInfo.email);
      localStorage.setItem('phone', userInfo.phone);
      localStorage.setItem('address', userInfo.address);
      localStorage.setItem('dateOfBirth', userInfo.dateOfBirth);
      localStorage.setItem('nationality', userInfo.nationality);
      localStorage.setItem('languages', userInfo.languages);
      localStorage.setItem('emergencyContact', userInfo.emergencyContact);

      alert("Cambios guardados correctamente");
    } catch (error) {
      console.error("Error al guardar en localStorage:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  }

  // --- Renderizado ---

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p>Cargando ajustes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm py-4 px-6">
          <h1 className="text-xl font-semibold text-gray-800">Ajustes</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Información del usuario (AHORA CON DATOS REALES) */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Información del Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-6">
                  <Avatar className="h-16 w-16 mr-4">
                    <AvatarImage src="/placeholder.svg?height=64&width=64" />
                    {/* Fallback con las iniciales del nombre real */}
                    <AvatarFallback>
                      {userInfo.displayName ? userInfo.displayName.substring(0, 2).toUpperCase() : "AU"}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Cambiar avatar
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="h-4 w-4 inline mr-2" />
                      Nombre completo
                    </label>
                    <Input
                      id="displayName"
                      value={userInfo.displayName}
                      onChange={(e) => handleChange("displayName", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Correo electrónico
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Número de teléfono
                    </label>
                    <Input
                      id="phone"
                      value={userInfo.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      Dirección
                    </label>
                    <Input
                      id="address"
                      value={userInfo.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      Guardar cambios
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documentos y configuración */}
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Documentos de Recolección</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-3" />
                        <span>Reporte_Mayo_2023.pdf</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-3" />
                        <span>Reporte_Junio_2023.pdf</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-3" />
                        <span>Reporte_Julio_2023.pdf</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

                          <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Documentos de Identificación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-3" />
                        <span>DNI</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-3" />
                        <span>Licencia de conducir</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-3" />
                        <span>Certificado de residencia</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>

                    <div className="pt-2">
                      <Button className="w-full bg-gray-700 hover:bg-gray-800">
                        <Upload className="h-4 w-4 mr-2" />
                        Subir nuevo documento
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* --- SECCIÓN PARA TODOS --- */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Preferencias</CardTitle>
              </CardHeader>
              <CardContent>
                {/* ... (Contenido de Preferencias) ... */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                      Idioma de la aplicación
                    </label>
                    <Select defaultValue="es">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* ... (Otras preferencias) ... */}
                  <div className="pt-4">
                    <Button className="bg-green-600 hover:bg-green-700">Guardar preferencias</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
    </main>
      </div >
    </div >
  )
}