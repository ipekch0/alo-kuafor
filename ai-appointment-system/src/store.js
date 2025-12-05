import { create } from 'zustand';

const useStore = create((set) => ({
    // UI State
    selectedView: 'dashboard',
    setSelectedView: (view) => set({ selectedView: view }),

    currentAppointmentId: null,
    setCurrentAppointmentId: (id) => set({ currentAppointmentId: id }),

    currentCustomerId: null,
    setCurrentCustomerId: (id) => set({ currentCustomerId: id }),

    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

    modals: {
        appointmentCreate: false,
        customerCreate: false,
    },
    // Edit Mode State
    isEditMode: false,
    setEditMode: (isEdit) => set({ isEditMode: isEdit }),

    openModal: (modalName) =>
        set((state) => ({
            modals: { ...state.modals, [modalName]: true },
        })),
    closeModal: (modalName) =>
        set((state) => ({
            modals: { ...state.modals, [modalName]: false },
        })),
}));

export default useStore;
