import { fetchWithAuth } from '@/app/utils/fetchWithAuth';

// El prefijo de la API que definiste en routes/report.py
const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reports`;

/**
 * Interfaz para la respuesta del reporte.
 * (Basado en schemas/report.py -> ReportResponse)
 */
export interface ReportResponse {
    guid: string;
    container_guid: string;
    reason: string;
    status: 'pending' | 'resolved'; // Definimos los estados
    reported_at: string; // La API devuelve datetime, que JS recibe como string
    reported_by_guid: string;
}

/**
 * Obtiene TODOS los reportes de avería.
 * Llama a: GET /api/v1/reports/all
 */
export async function getMalfunctionReports(): Promise<ReportResponse[]> {
    try {
        const res = await fetchWithAuth(`${BASE_URL}/all`, {
            method: 'GET',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Fallo al obtener los reportes.');
        }
        
        return await res.json();

    } catch (error: any) {
        console.error("Error en getMalfunctionReports:", error);
        throw new Error(error.message);
    }
}

/**
 * Marca un reporte de avería como 'resolved'.
 * Llama a: PUT /api/v1/reports/{report_guid}/resolve
 */
export async function resolveMalfunctionReport(report_guid: string): Promise<ReportResponse> {
    
    try {
        const res = await fetchWithAuth(`${BASE_URL}/${report_guid}/resolve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Fallo al resolver el reporte.');
        }

        return await res.json();

    } catch (error: any) {
        console.error("Error en resolveMalfunctionReport:", error);
        throw new Error(error.message);
    }
}