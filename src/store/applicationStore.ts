import { create } from 'zustand';
import { JobApplication } from '../types/application';
import { db } from '../lib/db';
import { useAuthStore } from './authStore';
import { generateUUID } from '../lib/crypto';

interface ApplicationStore {
  applications: JobApplication[];
  fetchApplications: () => Promise<void>;
  addApplication: (application: Omit<JobApplication, 'id'>) => Promise<void>;
  updateApplication: (id: string, application: Partial<JobApplication>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  applications: [],
  
  fetchApplications: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const applications = await db.getAllFromIndex('applications', 'by-user', userId);
    set({ applications });
  },

  addApplication: async (application) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const id = await generateUUID();
    const newApplication = { ...application, id };
    
    await db.add('applications', { ...newApplication, userId });
    set((state) => ({
      applications: [...state.applications, newApplication],
    }));
  },

  updateApplication: async (id, updatedFields) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const application = await db.get('applications', id);
    if (!application || application.userId !== userId) return;

    const updatedApplication = { ...application, ...updatedFields };
    await db.put('applications', updatedApplication);

    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...updatedFields } : app
      ),
    }));
  },

  deleteApplication: async (id) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    const application = await db.get('applications', id);
    if (!application || application.userId !== userId) return;

    await db.delete('applications', id);
    set((state) => ({
      applications: state.applications.filter((app) => app.id !== id),
    }));
  },
}));