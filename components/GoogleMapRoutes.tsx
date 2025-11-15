'use client'

import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api'
import { useState, useEffect, useRef } from 'react'
import { GOOGLE_MAP_LIBRARIES } from '@/lib/googleMapsConfig'
import Image from 'next/image'

const containerStyle = {
  width: '100%',
  height: '100%',
}

const centerDefault = {
  lat: -12.068572,
  lng: -77.043147,
}

interface LatLng {
  lat: number
  lng: number
}

interface Container {
  id: string
  location: LatLng
  name?: string
}

export interface SimulationResult {
  id: number
  created_at: string
  total_distance_km: number
  duration_min: number
  route: string[] 
  distances: string
}

interface MapComponentProps {
  containers: Container[]
  selectedContainer: Container | null
  route?: LatLng[]
  simulationData?: SimulationResult | null
}


export default function MapComponent({
  containers,
  selectedContainer,
  route = [],
  simulationData = null,
}: MapComponentProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GOOGLE_MAP_LIBRARIES,
  })

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(
    null
  )
  const mapRef = useRef<google.maps.Map | null>(null)

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map
  }

  useEffect(() => {
    console.log('Containers:', containers)
    if (
      selectedContainer &&
      mapRef.current &&
      typeof selectedContainer.location.lat === 'number' &&
      typeof selectedContainer.location.lng === 'number'
    ) {
      mapRef.current.panTo(selectedContainer.location)
    }
  }, [selectedContainer])

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google || route.length < 2) {
      setDirections(null)
      return
    }

    const cleanedRoute = route
      .map((point) => ({
        lat: Number(point.lat),
        lng: Number(point.lng),
      }))
      .filter(
        (p) =>
          typeof p.lat === 'number' &&
          typeof p.lng === 'number' &&
          !isNaN(p.lat) &&
          !isNaN(p.lng)
      )
    
    // Evita errores si cleanedRoute queda vacío después de filtrar
    if (cleanedRoute.length < 1) {
        setDirections(null)
        return
    }

    const directionsService = new window.google.maps.DirectionsService()

    directionsService.route(
      {
        origin: centerDefault,
        destination: cleanedRoute[cleanedRoute.length - 1],
        waypoints: cleanedRoute.slice(0, -1).map((point) => ({
          location: point,
          stopover: true,
        })),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result)
        } else {
          console.error('Error al calcular ruta:', status)
        }
      }
    )
  }, [isLoaded, route])
  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <p>Cargando mapa...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={centerDefault}
          zoom={14}
          onLoad={onLoad}
        >
          <Marker
            position={centerDefault}
            icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/truck.png' }}
            title="Base de camiones"
          />

          {containers.map((c, index) => {
            const lat = Number(c.location.lat)
            const lng = Number(c.location.lng)
            if (isNaN(lat) || isNaN(lng)) return null

            return (
              <Marker
                key={c.id}
                position={{ lat, lng }}
                title={c.id}
                label={(index + 1).toString()}
              />
            )
          })}

          {selectedContainer && selectedContainer.location && (
            <Marker
              position={{
                lat: Number(selectedContainer.location.lat),
                lng: Number(selectedContainer.location.lng),
              }}
              icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
            />
          )}

          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>

      {/* Panel lateral superpuesto */}
      {simulationData && (
        <div
          className="w-64 bg-white border-l border-gray-300 p-4 overflow-y-auto shadow-lg"
          style={{ flexShrink: 0 }} // Evita que el panel se encoja
        >
          {/* Título */}
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Simulación
          </h3>

          {/* Resumen de la Simulación */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Distancia Total:</span>
              <span className="font-medium">
                {simulationData.total_distance_km.toFixed(2)} km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duración Est.:</span>
              <span className="font-medium">
                {simulationData.duration_min.toFixed(0)} min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Paradas:</span>
              <span className="font-medium">
                {simulationData.route.length}
              </span>
            </div>
            <div className="text-xs text-gray-400 pt-2 border-t mt-2">
              {/* Formateamos la fecha para que sea legible */}
              Simulado: {new Date(simulationData.created_at).toLocaleString()}
            </div>
          </div>

          {/* Orden de la Ruta */}
          <h4 className="text-md font-semibold mb-2 text-gray-800">
            Orden de Ruta
          </h4>
          <ol className="list-decimal list-inside space-y-2">
            
            {/* Mapeamos el array de strings de simulationData.route.
              Asumo que 'routeName' es el string que quieres mostrar 
              (ej: ID o Nombre del contenedor).
            */}
            {simulationData.route.map((routeName, index) => (
              <li key={index} className="text-sm text-gray-700">
                {routeName}
              </li>
            ))}
            
          </ol>
        </div>
      )}
    </div>
  )
}