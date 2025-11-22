"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Sidebar from "@/components/sidebar"
import { getAllContainers,
  reportContainerMalfunction, 
    ReportPayload

 } from "@/app/services/containers/containersManagement"
import { Container } from "@/app/types/containers/containersType"

type UserRole = 'citizen' | 'worker' | null;
interface ContainerWithTimestamp extends Container {
  lastUpdatedClient: string
}

export default function ContainersPage() {
  const router = useRouter()
  const [containers, setContainers] = useState<ContainerWithTimestamp[]>([])
  const [userRole, setUserRole] = useState<UserRole>(null);
  const fetchContainers = async () => {
    try {
      const response = await getAllContainers()
      if (response && Array.isArray(response)) {
        const timestamped = response.map((c) => ({
          ...c,
          lastUpdatedClient: new Date().toLocaleString("es-PE"),
        }))
        setContainers(timestamped)
      } else {
        console.error("Error al obtener los contenedores")
      }
    } catch (error) {
      console.error("Error al obtener los contenedores:", error)
    }
  }

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('role');
      if (storedRole) {
        setUserRole(JSON.parse(storedRole).toLowerCase() as UserRole);
      }
    } catch (error) {
      console.error("Error al leer el rol de localStorage:", error);
    }
  }, []);

  useEffect(() => {
    fetchContainers()
    const interval = setInterval(() => {
      fetchContainers()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const getFillLevelColor = (level: number, limit: number) => {
    if (level >= limit) return "bg-red-500"
    if (level >= limit * 0.75) return "bg-yellow-500"
    return "bg-green-500"
  }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleReportMalfunction = async (containerGuid: string) => {
    // 1. Pedir la razón al usuario
    const reason = window.prompt(
        "Por favor, describe brevemente la avería (ej: 'Tapa rota', 'Contenedor desborda', etc.)"
    );

    // 2. Validar la razón
    if (!reason || reason.trim() === "") {
        alert("El reporte fue cancelado. Debes proporcionar una razón.");
        return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
        // 3. Preparar el payload
        const payload: ReportPayload = { reason: reason.trim() };

        // 4. Llamar al servicio
        
        await reportContainerMalfunction(containerGuid, payload);
        
        // 5. Éxito
        alert("¡Reporte enviado con éxito! Gracias por tu colaboración.");

    } catch (err: any) {
        // 6. Error
        console.error("Error al reportar avería:", err);
        setError(err.message); // Guardar el error
        alert(`Error al enviar el reporte: ${err.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm py-4 px-6">
          <h1 className="text-xl font-semibold text-gray-800">Listado de Contenedores</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel de llenado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {containers.map((container) => (
                    <tr key={container.guid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{container.guid}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{container.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  container.status === "inactive"
                                    ? "bg-gray-400"
                                    : getFillLevelColor(container.capacity, container.limit)
                                }`}
                                style={{
                                  width:
                                    container.status === "inactive"
                                      ? "100%"
                                      : `${container.capacity}%`,
                                }}
                              />
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              {container.status === "inactive"
                                ? "Sin lectura"
                                : `${container.capacity}%`}
                            </span>
                          </div>

                          <span className="text-xs text-gray-400 italic">
                            {container.status === "inactive"
                              ? "Lectura deshabilitada"
                              : `Última lectura: ${container.lastUpdatedClient}`}
                          </span>

                          {container.status !== "inactive" && (
                            <>
                              <span className="text-xs text-gray-500">
                                Umbral de alerta: {container.limit}%
                              </span>

                              {container.capacity >= container.limit && (
                                <span className="text-xs text-red-600 font-semibold">
                                  ⚠ Contenedor lleno
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{container.status}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                         {userRole === 'worker' && (
                        <Link href={`/containers/${container.guid}`}>
                          <Button className="bg-green-800 hover:bg-green-900 text-white">
                            Ver detalle
                          </Button>
                        </Link>)}
                        {/* ---  LÓGICA DE ROL APLICADA --- */}
                        {userRole === 'citizen' && (
                          <Button 
                            className="bg-red-800 hover:bg-red-900 text-white"
                            onClick={() => handleReportMalfunction(container.guid)}
                          >
                            Reportar Avería
                          </Button>
                        )}
                        {/* --- FIN DE LA LÓGICA DE ROL --- */}
                      </td>
                    </tr>
                  ))}
                  {containers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center italic py-6 text-gray-500">
                        No hay contenedores disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {userRole === 'worker' && (                  
        <div className="fixed bottom-8 right-8">
          <Link href="/containers/add-container">
            <Button className="h-14 w-14 rounded-full bg-green-700 hover:bg-green-800">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>)}
      </div>
    </div>
  )
}
