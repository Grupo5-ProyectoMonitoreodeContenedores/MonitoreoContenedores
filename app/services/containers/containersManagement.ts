export interface Container {
    guid: string;
    capacity: number; // Ejemplo: 95 (este es el valor numérico)
    status: 'active' | 'inactive'; // El estado operativo
    name:string;
    isFavorite: boolean;
    limit:number;
    latitude:string;
    longitude:string;
}

import { fetchWithAuth } from '@/app/utils/fetchWithAuth';


export async function getAllContainers(): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/containers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch containers');
  }

  const json = await res.json();
  return json;
}


export async function createContainer(containerData: any): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/containers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(containerData),
  });

  if (!res.ok) {
    throw new Error('Failed to create container');
  }

  const json = await res.json();
  return json;
}

export async function getContainerByGuid(guid: string): Promise<any> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/containers/${guid}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        },
    });
    
    if (!res.ok) {
        throw new Error('Failed to fetch container');
    }
    
    const json = await res.json();
    return json;
    }

export async function updateContainer(guid: string, containerData: any): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/containers/${guid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(containerData),
  });

  if (!res.ok) {
    throw new Error('Failed to update container');
  }

  const json = await res.json();
  return json;
}


export async function deleteContainer(guid: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/containers/${guid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to delete container');
  }

  return;
}


export async function bestRoute( guids: string[]): Promise<any> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/simulation/generate-simulation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ container_guids: guids })
  });

  if (!res.ok) {
    throw new Error('Failed to fetch best route');
  }

  const json = await res.json();
  return json;
}

/**
 * Obtiene una dirección formateada a partir de latitud y longitud
 * usando la API de Geocoding de Google Maps.
 */
export async function getAddressFromLatLng(lat: number, lng: number): Promise<string> {
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error("Google Maps API key no está configurada.");
        return "Clave de API no configurada";
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Error en la respuesta de Google Geocoding.");
        }

        const data = await response.json();

        if (data.status === 'OK' && data.results[0]) {
            // Devuelve la primera dirección formateada (ej: "Av. Arequipa 123, Lima")
            return data.results[0].formatted_address;
        } else if (data.status === 'ZERO_RESULTS') {
            return "Dirección no encontrada";
        } else {
            // Maneja otros estados de error de la API (OVER_QUERY_LIMIT, etc.)
            console.warn(`Error de Google Geocoding: ${data.status}`);
            return "Dirección no disponible";
        }
    } catch (error) {
        console.error("Error al contactar Google Geocoding API:", error);
        return "Error al cargar dirección";
    }
}

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/containers`;
export interface ReportPayload {
    reason: string;
}
export async function reportContainerMalfunction(
    guid: string, 
    payload: ReportPayload
): Promise<any> {
    
    const REPORT_URL = `${BASE_URL}/${guid}/report`; 

    try {
        const res = await fetchWithAuth(REPORT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Fallo al enviar el reporte.');
        }

        return await res.json(); 

    } catch (error: any) {
        console.error("Error en reportContainerMalfunction:", error);
        throw new Error(error.message || 'Error de red al reportar avería.'); 
    }
}