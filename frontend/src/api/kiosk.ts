import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const kioskApi = {
  getActivePatient: async (deviceUid: string) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/public/kiosk/device/${deviceUid}/active-patient/`
    );
    return response.data;
  },
};
