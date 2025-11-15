"use client"

import { useState, useEffect, useCallback } from "react" // 馃憟 Importar useCallback
import { useRouter } from "next/navigation"
import {
  BarChart3,
  TrendingUp,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button" // 馃憟 Importar Button
import Sidebar from "@/components/sidebar"

// --- Servicios ---
// (Asumo que estos son los paths correctos)
import {
  getMalfunctionReports,
  resolveMalfunctionReport,
  ReportResponse
} from "@/app/services/containers/reportService" // 馃憟 Corregido el path
import {
  getAllContainers,
  Container,
  getAddressFromLatLng
} from "@/app/services/containers/containersManagement" // 馃憟 Corregido el path

// --- Define tus umbrales ---
const UMBRAL_CRITICO = 90; // (90% o m谩s) Alerta Roja
const UMBRAL_ADVERTENCIA = 60; // (60% - 89%) Alerta Amarilla (tu cambio)
interface AlertWithAddress extends Container {
  address: string;
}

export default function Home() {
  const router = useRouter()

  // --- ESTADOS ---
  const [activeContainers, setActiveContainers] = useState<Container[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [citizenAlerts, setCitizenAlerts] = useState<ReportResponse[]>([]); // Alertas de ciudadanos
  const [isResolving, setIsResolving] = useState(false); // Estado para el bot贸n de resolver
  const [alertsWithAddresses, setAlertsWithAddresses] = useState<AlertWithAddress[]>([]); // Alertas de capacidad
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false); // Carga de direcciones


  // --- FUNCIONES DE DATOS (Movidas fuera de useEffect) ---

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true); // Activa el loading principal
    setError(null);
    setAlertsWithAddresses([]); // Limpiar en cada carga
    try {
      const [allContainers, allReports] = await Promise.all([
        getAllContainers(),
        getMalfunctionReports() // Obtenemos los reportes
      ]);

      // Filtramos solo los que est谩n operativos
      const activeList = allContainers.filter((c: { status: string }) => c.status === 'active');
      setActiveContainers(activeList);
      setCitizenAlerts(allReports);

    } catch (err: any) {
      console.error("Error al cargar datos del dashboard:", err);
      setError("No se pudieron cargar las m茅tricas. Intente de nuevo.");
    } finally {
      setIsLoading(false); // Termina la carga principal
    }
  }, []); // useCallback para que la funci贸n no cambie

  const handleResolveReport = async (reportGuid: string) => {
    setIsResolving(true); // Activa el loading del bot贸n
    try {
      await resolveMalfunctionReport(reportGuid);
      // 脡xito: Volvemos a cargar todos los datos para refrescar la lista
      await loadDashboardData();
    } catch (err: any) {
      console.error("Error al resolver reporte:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsResolving(false); // Desactiva el loading del bot贸n
    }
  };

  // --- EFECTO 1: Cargar la lista de contenedores y reportes ---
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]); // Se ejecuta solo una vez al montar

  // --- EFECTO 2: Buscar direcciones cuando los contenedores cambian ---
  useEffect(() => {
    if (activeContainers.length === 0) return;

    // 1. Calcular las alertas de capacidad
    const criticalAlerts = activeContainers.filter(
      c => c.capacity >= UMBRAL_CRITICO
    );
    const warningAlerts = activeContainers.filter(
      c => c.capacity >= UMBRAL_ADVERTENCIA && c.capacity < UMBRAL_CRITICO
    );

    const allActiveAlerts = [...criticalAlerts, ...warningAlerts]
      .sort((a, b) => b.capacity - a.capacity);

    if (allActiveAlerts.length === 0) {
      setAlertsWithAddresses([]);
      return;
    }

    // 2. Funci贸n para buscar direcciones
    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const addressPromises = allActiveAlerts.map(alerta => {
          if (alerta.latitude && alerta.longitude) {
            return getAddressFromLatLng(
              parseFloat(alerta.latitude),
              parseFloat(alerta.longitude)
            );
          }
          return Promise.resolve("Coordenadas no disponibles");
        });

        const resolvedAddresses = await Promise.all(addressPromises);

        const combinedAlerts: AlertWithAddress[] = allActiveAlerts.map((alerta, index) => ({
          ...alerta,
          address: resolvedAddresses[index]
        }));

        setAlertsWithAddresses(combinedAlerts);

      } catch (googleError) {
        console.error("Error al buscar direcciones en Google Maps:", googleError);
        setAlertsWithAddresses(allActiveAlerts.map(alerta => ({
          ...alerta,
          address: "Error al cargar direcci贸n"
        })));
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();

  }, [activeContainers]);


  // --- C脕LCULO DE M脡TRICAS (en el render) ---
  const totalCount = activeContainers.length;
  const criticalCount = activeContainers.filter(
    c => c.capacity >= UMBRAL_CRITICO
  ).length;

  // Filtramos solo los reportes pendientes para la nueva tarjeta
  const pendingReports = citizenAlerts.filter(r => r.status === 'pending');


  // --- RENDERIZADO (Carga Principal) ---
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Cargando m茅tricas...</p>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO (Error) ---
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO CON DATOS ---
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Bienvenido al sistema WasteTrack</h1>
            <p className="text-gray-600">Panel de control y monitoreo</p>
          </div>

          {/* Stats Overview - DIN脕MICO */}
          <div className="grid grid-cols-2 gap-6 mb-6">

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Contenedores Activos</p>
                    {/* DATO DIN脕MICO */}
                    <h3 className="text-2xl font-bold mt-1">{totalCount}</h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Trash2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500 ml-2">Operativos en el sistema</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contenedores Cr铆ticos ({UMBRAL_CRITICO}%)</p>
                    {/* DATO DIN脕MICO */}
                    <h3 className="text-2xl font-bold mt-1">{criticalCount}</h3>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-500 ml-2">Requieren recojo inmediato</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Alerts - DIN脕MICO */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Alertas de Capacidad ({alertsWithAddresses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* --- INICIO DEL MAPEO DIN脕MICO --- */}
                  {isLoadingAddresses ? (
                    <p className="text-sm text-gray-500">Cargando direcciones de alertas...</p>
                  ) : alertsWithAddresses.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay alertas de capacidad en este momento.</p>
                  ) : (
                    alertsWithAddresses.map((alerta) => {
                      const esCritico = alerta.capacity >= UMBRAL_CRITICO;
                      return (
                        <div
                          key={alerta.guid}
                          className={`p-3 border-l-4 rounded ${esCritico
                              ? 'bg-red-50 border-red-500'
                              : 'bg-yellow-50 border-yellow-500'
                            }`}
                        >
                          <div className="flex items-center">
                            <AlertTriangle className={`h-5 w-5 mr-2 ${esCritico ? 'text-red-500' : 'text-yellow-500'
                              }`} />
                            <p className="text-sm font-medium">
                              Contenedor {alerta.guid.substring(0, 8)}... al {alerta.capacity}% de capacidad
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{alerta.address}</p>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- 馃憞 [NUEVA SECCI脫N] ALERTAS CIUDADANOS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  Alertas Ciudadanos (Pendientes: {pendingReports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">

                  {pendingReports.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay reportes de ciudadanos pendientes.</p>
                  ) : (
                    pendingReports.map((report) => (
                      <div
                        key={report.guid}
                        className="p-3 border-l-4 rounded bg-blue-50 border-blue-500"
                      >
                        <div className="flex justify-between items-center">
                          {/* Detalles del Reporte */}
                          <div>
                            <p className="text-sm font-medium text-blue-800">
                              Contenedor: {report.container_guid}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              Raz贸n: "{report.reason}"
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Reportado el: {new Date(report.reported_at).toLocaleString()}
                            </p>
                          </div>

                          {/* Bot贸n de Acci贸n */}
                          <div>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleResolveReport(report.guid)}
                              disabled={isResolving}
                            >
                              {isResolving ? 'Resolviendo...' : 'Resolver'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                </div>
              </CardContent>
            </Card>
          </div>

        </main>
      </div>
    </div>
  )
}