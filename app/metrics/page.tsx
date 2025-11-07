"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, TrendingUp, Trash2, MapPin, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"

export default function Home() {
  const router = useRouter()


  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Bienvenido al sistema WasteTrack</h1>
            <p className="text-gray-600">Panel de control y monitoreo</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Contenedores</p>
                    <h3 className="text-2xl font-bold mt-1">124</h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Trash2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+5%</span>
                  <span className="text-gray-500 ml-2">desde el mes pasado</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rutas Activas</p>
                    <h3 className="text-2xl font-bold mt-1">8</h3>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-blue-600 font-medium">+2</span>
                  <span className="text-gray-500 ml-2">desde la semana pasada</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contenedores Críticos</p>
                    <h3 className="text-2xl font-bold mt-1">12</h3>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-red-600 font-medium">+3</span>
                  <span className="text-gray-500 ml-2">desde ayer</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Eficiencia de Recolección</p>
                    <h3 className="text-2xl font-bold mt-1">87%</h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+2%</span>
                  <span className="text-gray-500 ml-2">desde el mes pasado</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-gray-500" />
                  Residuos Recolectados por Tipo (Toneladas)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Orgánico</span>
                      <span className="text-sm font-medium">45.2</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Plástico</span>
                      <span className="text-sm font-medium">32.8</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "55%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Papel</span>
                      <span className="text-sm font-medium">28.5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "48%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Vidrio</span>
                      <span className="text-sm font-medium">18.3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">General</span>
                      <span className="text-sm font-medium">22.1</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gray-600 h-2.5 rounded-full" style={{ width: "37%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-gray-500" />
                  Eficiencia de Rutas (Últimos 7 días)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="w-full h-full relative">
                    {/* Simulación de gráfico de líneas */}
                    <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                      <div className="w-1/7 h-[60%] bg-green-500 mx-1 rounded-t-sm"></div>
                      <div className="w-1/7 h-[75%] bg-green-500 mx-1 rounded-t-sm"></div>
                      <div className="w-1/7 h-[65%] bg-green-500 mx-1 rounded-t-sm"></div>
                      <div className="w-1/7 h-[80%] bg-green-500 mx-1 rounded-t-sm"></div>
                      <div className="w-1/7 h-[70%] bg-green-500 mx-1 rounded-t-sm"></div>
                      <div className="w-1/7 h-[85%] bg-green-500 mx-1 rounded-t-sm"></div>
                      <div className="w-1/7 h-[90%] bg-green-500 mx-1 rounded-t-sm"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full border-t border-gray-300"></div>
                    <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 pt-2">
                      <span>Lun</span>
                      <span>Mar</span>
                      <span>Mié</span>
                      <span>Jue</span>
                      <span>Vie</span>
                      <span>Sáb</span>
                      <span>Dom</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Trash2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contenedor C-004 recolectado</p>
                      <p className="text-xs text-gray-500">Hace 35 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nueva ruta creada: Ruta Este</p>
                      <p className="text-xs text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Contenedor C-002 alcanzó 75% de capacidad</p>
                      <p className="text-xs text-gray-500">Hace 3 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Trash2 className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nuevo contenedor registrado: C-008</p>
                      <p className="text-xs text-gray-500">Hace 5 horas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Alertas Activas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-sm font-medium">Contenedor C-001 al 95% de capacidad</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Av. Arequipa 123, Lima</p>
                  </div>
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-sm font-medium">Contenedor C-004 al 93% de capacidad</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Calle Los Cedros 123, San Isidro</p>
                  </div>
                  <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                      <p className="text-sm font-medium">Contenedor C-003 al 67% de capacidad</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Av. Angamos Este 789, Miraflores</p>
                  </div>
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                      <p className="text-sm font-medium">Ruta Norte retrasada 15 minutos</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Camión #103 - Conductor: Carlos Rodríguez</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}