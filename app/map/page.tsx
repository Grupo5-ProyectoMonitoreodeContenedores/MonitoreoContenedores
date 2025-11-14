"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Info } from "lucide-react"
import Sidebar from "@/components/sidebar"
import MapComponent from "@/components/GoogleMapRoutes"
import { SimulationResult } from "@/components/GoogleMapRoutes"
import ScheduleCollectionModal from "@/components/schedule-collection-modal"
import { getAllContainers } from "@/app/services/containers/containersManagement"

interface Container {
  id: string
  name: string
  location: { lat: number; lng: number }
  fillLevel: number
  type: string
  lastCollection: string
  status: string
  limit: number
}

interface RouteType {
  id: string
  name: string
  containers: string[]
  distance: number
  estimatedTime: number
  status: "active" | "completed" | "planned"
}

export default function MapPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null)
  const [activeView, setActiveView] = useState<"containers" | "routes">("containers")
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [containers, setContainers] = useState<Container[]>([])
  const [guids, setGuids] = useState<string[]>([])
  const [routeCoordinates, setRouteCoordinates] = useState<{ lat: number; lng: number }[]>([])
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [simulationData1, setSimulationData] = useState<SimulationResult | null>(null)

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const response = await getAllContainers()
        if (response && Array.isArray(response)) {
          const transformed = response
            .filter((c) => c.status === "active")
            .map((c) => ({
              id: c.guid,
              name: c.name,
              location: { lat: c.latitude, lng: c.longitude },
              fillLevel: c.capacity,
              type: "Desconocido",
              lastCollection: "2025-06-15", // reemplaza con dato real si lo tienes
              status: c.status,
              limit: c.limit ?? 80,
            }))
          setContainers(transformed)
          setGuids(transformed.map(container => container.id))
        }
        
      } catch (error) {
        console.error("Error al cargar contenedores:", error)
      }
    }
    fetchContainers()
  }, [])

  const handleRouteGenerated = (response: SimulationResult) => {
    setSimulationData(response)
  }

  const filteredContainers = containers.filter(
    (container) =>
      container.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      container.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleScheduleCollection = () => {
    console.log("Programar recolección para el contenedor:", selectedContainer)
    setIsScheduleModalOpen(true)
    console.log("Guids disponibles:", guids)
    console.log("Valor de modales:", isScheduleModalOpen)
  }


  const getRouteCoordinatesFromGuids = (orderedGuids: string[]) => {
    return orderedGuids
      .map((guid) => {
        const container = containers.find((c) => c.id === guid)
        if (container) {
          return {
            lat: Number(container.location.lat),
            lng: Number(container.location.lng),
          }
        }
        return null
      })
      .filter((coord) => coord !== null) as { lat: number; lng: number }[]
  }
  

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm py-4 px-6">
          <h1 className="text-xl font-semibold text-gray-800">Mapa de Contenedores</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar..."
                className="pl-9 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <div className="w-full flex items-center justify-end">
                  <Button className="w-100 bg-green-600 hover:bg-green-700" onClick={handleScheduleCollection}>
                    Programar recolección
                  </Button>
                </div>
          </div>

        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4">
              <div className="space-y-3">
                {filteredContainers.map((container) => (
                  <div
                    key={container.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedContainer?.id === container.id
                        ? "border-green-500 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedContainer(container)}
                  >
                    <h3 className="font-medium">{container.id}</h3>
                    <p className="text-sm text-gray-500">{container.name}</p>
                    <div className="flex items-center mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            container.fillLevel >= container.limit
                              ? "bg-red-600"
                              : container.fillLevel >= container.limit * 0.75
                              ? "bg-yellow-500"
                              : "bg-green-600"
                          }`}
                          style={{ width: `${container.fillLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium ml-2">{container.fillLevel}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Umbral de alerta: {container.limit}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
          <MapComponent
              containers={containers}
              selectedContainer={selectedContainer}
              route={routeCoordinates}
              simulationData={simulationData1}
            />
          </div>

          {selectedContainer && (
            <div className="w-80 bg-white border-l overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center">
                  <Info className="h-4 w-4 mr-2 text-green-600" />
                  Detalles del Contenedor
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedContainer(null)}>×</Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-gray-500">Nombre</h4>
                  <p className="font-medium">{selectedContainer.name}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Nivel de llenado</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className={`h-2.5 rounded-full ${
                        selectedContainer.fillLevel >= selectedContainer.limit
                          ? "bg-red-600"
                          : selectedContainer.fillLevel >= selectedContainer.limit * 0.75
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                      style={{ width: `${selectedContainer.fillLevel}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1">{selectedContainer.fillLevel}%</p>
                  <p className="text-xs text-gray-500">Umbral de alerta: {selectedContainer.limit}%</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Última recolección</h4>
                  <p className="font-medium">{selectedContainer.lastCollection}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Ubicación</h4>
                  <p className="font-medium">
                    {Number(selectedContainer.location.lat).toFixed(6)},{" "}
                    {Number(selectedContainer.location.lng).toFixed(6)}
                  </p>
                </div>
                
              </div>
            </div>
          )}
        </div>

        {(
          <ScheduleCollectionModal

            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            guids={guids}
            onRouteGenerated={(response) => {
              setSimulationData(response);
              const coords = getRouteCoordinatesFromGuids(response.route)
              setRouteCoordinates(coords)
              console.log('Coordenadas generadas:', coords)
              setIsScheduleModalOpen(false)
              setLoadingRoute(false)
            }}
            setLoadingRoute={setLoadingRoute}

          />
        )}
      </div>
    </div>
  )
}
