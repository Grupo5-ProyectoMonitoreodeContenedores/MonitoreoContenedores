"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Info, Bell, X } from "lucide-react"
import Sidebar from "@/components/sidebar"
import MapComponent from "@/components/GoogleMapRoutes"
import { SimulationResult } from "@/components/GoogleMapRoutes"
import ScheduleCollectionModal from "@/components/schedule-collection-modal"
import { getAllContainers } from "@/app/services/containers/containersManagement"
import LastRouteFooter from "@/components/LastRouteFooter"

// --- INTERFACES ---
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

interface Simulation {
  id: number
  created_at: string
  total_distance_km: number
  duration_min: number
  route: string[]
  distances: string
}

type UserRole = 'citizen' | 'worker' | null;

export default function MapPage() {
  const router = useRouter()

  // --- ESTADOS ---
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<RouteType | null>(null)
  const [activeView, setActiveView] = useState<"containers" | "routes">("containers")
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [containers, setContainers] = useState<Container[]>([])
  const [guids, setGuids] = useState<string[]>([])
  
  // Estados de Ruta y Mapa
  const [routeCoordinates, setRouteCoordinates] = useState<{ lat: number; lng: number }[]>([])
  const [loadingRoute, setLoadingRoute] = useState(false)
  const [simulationData1, setSimulationData] = useState<SimulationResult | null>(null)
  const [allSimulations, setAllSimulations] = useState<Simulation[]>([])
  
  // Estados de Usuario y Alertas
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [newRouteAlert, setNewRouteAlert] = useState<Simulation | null>(null)
  
  // Referencia para rastrear el último ID sin renderizar
  const latestSimulationIdRef = useRef<number>(0); 

  // --- EFECTOS ---

  // 1. Cargar Rol
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

  // 2. Cargar Contenedores
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
              lastCollection: "2025-06-15", 
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
  }, []);

  // 3. Cargar Simulaciones + Lógica de Polling (Alertas)
  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        const response = await fetch('https://backend-api-monitoreo.onrender.com/api/v1/simulation/get-all-simulations')
        
        if (response.ok) {
          const data = await response.json()

          // --- CORRECCIÓN AQUÍ ---
          // Ordenamos explícitamente: ID mayor va primero (Descendente)
          const sortedData = data.sort((a: Simulation, b: Simulation) => b.id - a.id);

          // Guardamos el array ya ordenado
          setAllSimulations(sortedData)
          
          // Inicializamos la referencia
          if (sortedData.length > 0) {
              // Como ya ordenamos, el índice 0 SIEMPRE es el ID más alto
              latestSimulationIdRef.current = sortedData[0].id;
          }
        } else {
          console.error('Error al obtener simulaciones:', response.statusText)
        }
      } catch (error) {
        console.error('Error de red al cargar simulaciones:', error)
      }
    }
    // ... resto del código (polling, etc)

    // Carga inicial
    fetchSimulations();

    // --- POLLING (Solo para Ciudadanos) ---
    let intervalId: NodeJS.Timeout;

    if (userRole === 'citizen') {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch('https://backend-api-monitoreo.onrender.com/api/v1/simulation/get-all-simulations');
          if (response.ok) {
            const data = await response.json();
            
            if (data.length > 0) {
              // Buscamos la simulación más nueva (asumiendo que es la primera del array o por ID)
              const latestSim = data.reduce((prev: Simulation, current: Simulation) => (prev.id > current.id) ? prev : current);
              
              // Si detectamos un ID nuevo que no conocíamos
              if (latestSim.id > latestSimulationIdRef.current) {
                console.log("¡Alerta! Nueva ruta detectada:", latestSim.id);
                
                // 1. Actualizamos referencia
                latestSimulationIdRef.current = latestSim.id;
                
                // 2. Actualizamos datos globales
                setAllSimulations(data);
                
                // 3. Mostramos Alerta
                setNewRouteAlert(latestSim);
              }
            }
          }
        } catch (error) {
           // Errores de red silenciosos en polling
        }
      }, 10000); // Revisar cada 10 segundos
    }

    // Cleanup al desmontar
    return () => {
      if (intervalId) clearInterval(intervalId);
    };

  }, [userRole]); // Se reinicia si cambia el rol

  // --- HANDLERS ---

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

  const handleViewNewRoute = () => {
      // Acción al hacer click en "Ver detalles" de la alerta
      setNewRouteAlert(null);
      // Aquí podrías añadir lógica para hacer scroll al footer o resaltar el mapa
  }

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-gray-100 relative">
      
      {/* === POPUP DE ALERTA === */}
      {newRouteAlert && (
        <div className="fixed top-6 right-6 z-50 w-96 bg-white rounded-lg shadow-2xl border-l-4 border-green-600 p-4 animate-in fade-in slide-in-from-top-5 duration-300">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                        <Bell className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">¡Nueva Ruta de Recolección!</h4>
                        <p className="text-sm text-gray-600 mt-1">
                            Se ha programado un camión para la recolección.<br/>
                            <span className="font-medium text-xs">
                                Hora programada: {new Date(newRouteAlert.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setNewRouteAlert(null)}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setNewRouteAlert(null)}
                >
                    Cerrar
                </Button>
                <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleViewNewRoute}
                >
                    Entendido
                </Button>
            </div>
        </div>
      )}

      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
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
            {userRole === 'worker' && (
              <div className="w-full flex items-center justify-end">
                <Button className="w-100 bg-green-600 hover:bg-green-700" onClick={handleScheduleCollection}>
                  Programar recolección
                </Button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* SIDEBAR LISTA CONTENEDORES */}
          <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4">
              <div className="space-y-3">
                {filteredContainers.map((container) => (
                  <div
                    key={container.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedContainer?.id === container.id
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
                          className={`h-2 rounded-full ${container.fillLevel >= container.limit
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

          {/* COMPONENTE MAPA */}
          <div className="flex-1 relative">
            <MapComponent
              containers={containers}
              selectedContainer={selectedContainer}
              route={routeCoordinates}
              simulationData={simulationData1}
            />
          </div>

          {/* PANEL DETALLES */}
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
                      className={`h-2.5 rounded-full ${selectedContainer.fillLevel >= selectedContainer.limit
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

        {/* FOOTER HISTORIAL */}
        <div className="z-10">
             <LastRouteFooter allSimulations={allSimulations} />     
        </div>

        {/* MODAL WORKER */}
        {(
          <ScheduleCollectionModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            guids={guids}
            setLoadingRoute={setLoadingRoute}
            onRouteGenerated={(response) => {
              // 1. Mapa Panel Lateral
              setSimulationData(response);
              
              // 2. Líneas Mapa
              const coords = getRouteCoordinatesFromGuids(response.route)
              setRouteCoordinates(coords)
              
              // 3. Footer (Agregamos al inicio del array)
              setAllSimulations((prev) => [response as unknown as Simulation, ...prev])
              
              // 4. Actualizamos referencia para que el worker NO reciba su propia alerta
              latestSimulationIdRef.current = response.id;

              setIsScheduleModalOpen(false)
              setLoadingRoute(false)
            }}
          />
        )}
      </div>
    </div>
  )
}
