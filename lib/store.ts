import { create } from 'zustand'
import { Database } from '@/types/database'

type Application = Database['public']['Tables']['applications']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

interface AppState {
  applications: Application[]
  tasks: Task[]
  selectedView: 'board' | 'table' | 'calendar'
  filterStatus: string | null
  filterPriority: string | null
  setApplications: (applications: Application[]) => void
  setTasks: (tasks: Task[]) => void
  setSelectedView: (view: 'board' | 'table' | 'calendar') => void
  setFilterStatus: (status: string | null) => void
  setFilterPriority: (priority: string | null) => void
  addApplication: (application: Application) => void
  updateApplication: (id: string, updates: Partial<Application>) => void
  deleteApplication: (id: string) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  applications: [],
  tasks: [],
  selectedView: 'board',
  filterStatus: null,
  filterPriority: null,
  setApplications: (applications) => set({ applications }),
  setTasks: (tasks) => set({ tasks }),
  setSelectedView: (view) => set({ selectedView: view }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  addApplication: (application) =>
    set((state) => ({ applications: [...state.applications, application] })),
  updateApplication: (id, updates) =>
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...updates } : app
      ),
    })),
  deleteApplication: (id) =>
    set((state) => ({
      applications: state.applications.filter((app) => app.id !== id),
    })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),
}))
