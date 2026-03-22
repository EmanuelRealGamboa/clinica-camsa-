import axios from 'axios';

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.error) return data.error;
    if (data?.detail) return data.detail;
    if (data?.message) return data.message;

    if (error.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado. Intente nuevamente.';
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Error de conexión. Verifique su conexión a internet.';
    }
    if (error.response?.status === 429) {
      return 'Demasiadas solicitudes. Espere un momento e intente nuevamente.';
    }
    if (error.response?.status === 403) {
      return 'No tiene permisos para realizar esta acción.';
    }
    if (error.response?.status === 404) {
      return 'El recurso solicitado no fue encontrado.';
    }
    if (error.response?.status && error.response.status >= 500) {
      return 'Error del servidor. Intente nuevamente más tarde.';
    }
  }
  return 'Ocurrió un error inesperado.';
}
