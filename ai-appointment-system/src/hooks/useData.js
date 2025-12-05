import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

// ============================================
// SALONS
// ============================================

export const useSalons = () => {
    return useQuery({
        queryKey: ['salons'],
        queryFn: () => apiClient.getSalons(),
    });
};

export const useMySalon = () => {
    return useQuery({
        queryKey: ['mySalon'],
        queryFn: () => apiClient.getMySalon(),
    });
};

export const useSalon = (id) => {
    return useQuery({
        queryKey: ['salons', id],
        queryFn: () => apiClient.getSalon(id),
        enabled: !!id,
    });
};

export const useCreateSalon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => apiClient.createSalon(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salons'] });
        },
    });
};

export const useUpdateMySalon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => apiClient.updateMySalon(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mySalon'] });
        },
    });
};

export const useUpdateSalon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => apiClient.updateSalon(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salons'] });
        },
    });
};

export const useDeleteSalon = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiClient.deleteSalon(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['salons'] });
        },
    });
};

// ============================================
// PROFESSIONALS
// ============================================

export const useProfessionals = () => {
    return useQuery({
        queryKey: ['professionals'],
        queryFn: () => apiClient.getProfessionals(),
    });
};

export const useCreateProfessional = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => apiClient.createProfessional(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals'] });
        },
    });
};

export const useUpdateProfessional = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => apiClient.updateProfessional(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals'] });
        },
    });
};

export const useDeleteProfessional = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiClient.deleteProfessional(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals'] });
        },
    });
};

// ============================================
// SERVICES
// ============================================

export const useServices = () => {
    return useQuery({
        queryKey: ['services'],
        queryFn: () => apiClient.getServices(),
    });
};

export const useCreateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => apiClient.createService(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const useUpdateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => apiClient.updateService(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const useDeleteService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiClient.deleteService(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

// ============================================
// CUSTOMERS
// ============================================

export const useCustomers = () => {
    return useQuery({
        queryKey: ['customers'],
        queryFn: () => apiClient.getCustomers(),
    });
};

export const useCustomer = (id) => {
    return useQuery({
        queryKey: ['customers', id],
        queryFn: () => apiClient.getCustomer(id),
        enabled: !!id,
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => apiClient.createCustomer(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => apiClient.updateCustomer(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiClient.deleteCustomer(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};

// ============================================
// APPOINTMENTS
// ============================================

export const useAppointments = () => {
    return useQuery({
        queryKey: ['appointments'],
        queryFn: () => apiClient.getAppointments(),
    });
};

export const useAppointment = (id) => {
    return useQuery({
        queryKey: ['appointments', id],
        queryFn: () => apiClient.getAppointment(id),
        enabled: !!id,
    });
};

export const useCreateAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => apiClient.createAppointment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};

export const useUpdateAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => apiClient.updateAppointment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};

export const useDeleteAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => apiClient.deleteAppointment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};
