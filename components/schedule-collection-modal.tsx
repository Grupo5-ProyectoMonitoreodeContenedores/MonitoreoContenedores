"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { bestRoute } from '@/app/services/containers/containersManagement' // ajusta si es necesario

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Truck, User, CalendarCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ScheduleCollectionModalProps {
  isOpen: boolean
  onClose: () => void
  guids: string[] // <-- nuevo
  onRouteGenerated?: (route: any) => void // opcional: si quieres enviarla al padre
  setLoadingRoute: (val: boolean) => void

}

export default function ScheduleCollectionModal({

  isOpen,
  onClose,
  guids, // <-- nuevo
  onRouteGenerated, // opcional: si quieres enviarla al padre
  setLoadingRoute, // <-- nuevo
  
}: ScheduleCollectionModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    priority: "normal",
    driver: "",
    vehicle: "",
    notes: "",
  })



  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

 

  const handleGenerateRoute = async () => {
    try {
      setLoading(true)
      setLoadingRoute(true)  // ← activa el GIF

      const customCreatedAt = `${formData.date}T${formData.time}:00`
      const response = await bestRoute(guids, customCreatedAt)
      if (onRouteGenerated) onRouteGenerated(response)
    } catch (error) {
      alert("Error al generar la ruta.")
    } finally {
      setLoading(false)
      setLoadingRoute(false)  // ← desactiva el GIF
    }
  }
  

  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <CalendarCheck className="mr-2 h-5 w-5" />
            Programar Recolección
          </DialogTitle>
          <DialogDescription>
            Programar recolección para todos los contenedores de residuos
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-2" />
                Fecha
              </label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="h-4 w-4 inline mr-2" />
                Hora
              </label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className="w-full"
                required
              />
            </div>
          </div>


          <div>
            <label htmlFor="driver" className="block text-sm font-medium text-gray-700 mb-1">
              <User className="h-4 w-4 inline mr-2" />
              Conductor
            </label>
            <Select value={formData.driver} onValueChange={(value) => handleChange("driver", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar conductor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driver1">Carlos Rodríguez</SelectItem>
                <SelectItem value="driver2">Ana Gómez</SelectItem>
                <SelectItem value="driver3">Luis Torres</SelectItem>
                <SelectItem value="driver4">María Sánchez</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="vehicle" className="block text-sm font-medium text-gray-700 mb-1">
              <Truck className="h-4 w-4 inline mr-2" />
              Vehículo
            </label>
            <Select value={formData.vehicle} onValueChange={(value) => handleChange("vehicle", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar vehículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vehicle1">Camión 01 - XYZ-123</SelectItem>
                <SelectItem value="vehicle2">Camión 02 - ABC-456</SelectItem>
                <SelectItem value="vehicle3">Camión 03 - DEF-789</SelectItem>
                <SelectItem value="vehicle4">Camión 04 - GHI-012</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerateRoute}
            disabled={loading || !formData.date || !formData.time || !formData.driver || !formData.vehicle}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Procesando..." : "Generar ruta óptima"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}