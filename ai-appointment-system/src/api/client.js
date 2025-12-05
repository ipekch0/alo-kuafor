// AI Randevu API Client
const API_URL = '/api';

// Get JWT token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

class APIClient {
    async get(endpoint) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    }

    async post(endpoint, data) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API Error');
        }
        return response.json();
    }

    async put(endpoint, data) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API Error');
        }
        return response.json();
    }

    async delete(endpoint) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'API Error');
        }
        return response.json();
    }

    // ============================================
    // SALONS (formerly Vehicles)
    // ============================================
    async getSalons() {
        return this.get('/salons');
    }

    async getMySalon() {
        return this.get('/salons/mine');
    }

    async getSalon(id) {
        return this.get(`/salons/${id}`);
    }

    async createSalon(data) {
        return this.post('/salons', data);
    }

    async updateMySalon(data) {
        return this.put('/salons/mine', data);
    }

    async updateSalon(id, data) {
        return this.put(`/salons/${id}`, data);
    }

    async deleteSalon(id) {
        return this.delete(`/salons/${id}`);
    }

    // ============================================
    // PROFESSIONALS (formerly Employees)
    // ============================================
    async getProfessionals() {
        return this.get('/professionals');
    }

    async getProfessional(id) {
        return this.get(`/professionals/${id}`);
    }

    async createProfessional(data) {
        return this.post('/professionals', data);
    }

    async updateProfessional(id, data) {
        return this.put(`/professionals/${id}`, data);
    }

    async deleteProfessional(id) {
        return this.delete(`/professionals/${id}`);
    }

    // ============================================
    // SERVICES (formerly Inspection Types)
    // ============================================
    async getServices() {
        return this.get('/services');
    }

    async getService(id) {
        return this.get(`/services/${id}`);
    }

    async createService(data) {
        return this.post('/services', data);
    }

    async updateService(id, data) {
        return this.put(`/services/${id}`, data);
    }

    async deleteService(id) {
        return this.delete(`/services/${id}`);
    }

    // ============================================
    // CUSTOMERS (formerly Vehicle Owners)
    // ============================================
    async getCustomers() {
        return this.get('/customers');
    }

    async getCustomer(id) {
        return this.get(`/customers/${id}`);
    }

    async createCustomer(data) {
        return this.post('/customers', data);
    }

    async updateCustomer(id, data) {
        return this.put(`/customers/${id}`, data);
    }

    async deleteCustomer(id) {
        return this.delete(`/customers/${id}`);
    }

    // ============================================
    // APPOINTMENTS (formerly Inspections)
    // ============================================
    async getAppointments() {
        return this.get('/appointments');
    }

    async getAppointment(id) {
        return this.get(`/appointments/${id}`);
    }

    async createAppointment(data) {
        return this.post('/appointments', data);
    }

    async updateAppointment(id, data) {
        return this.put(`/appointments/${id}`, data);
    }

    async deleteAppointment(id) {
        return this.delete(`/appointments/${id}`);
    }
}

export default new APIClient();
