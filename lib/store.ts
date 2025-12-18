import { create } from 'zustand'
import { Database } from '@/types/database'

type Application = Database['public']['Tables']['applications']['Row']
type Task = Database['public']['Tables']['tasks']['Row']
type Interview = Database['public']['Tables']['interviews']['Row']

interface AppState {
  applications: Application[]
  tasks: Task[]
  interviews: Interview[]
  selectedView: 'board' | 'table' | 'calendar'
  filterStatus: string | null
  filterPriority: string | null
  filterWorkType: string | null
  searchQuery: string
  setApplications: (applications: Application[]) => void
  setTasks: (tasks: Task[]) => void
  setInterviews: (interviews: Interview[]) => void
  setSelectedView: (view: 'board' | 'table' | 'calendar') => void
  setFilterStatus: (status: string | null) => void
  setFilterPriority: (priority: string | null) => void
  setFilterWorkType: (workType: string | null) => void
  setSearchQuery: (query: string) => void
  addApplication: (application: Application) => void
  updateApplication: (id: string, updates: Partial<Application>) => void
  deleteApplication: (id: string) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  addInterview: (interview: Interview) => void
  updateInterview: (id: string, updates: Partial<Interview>) => void
  deleteInterview: (id: string) => void
  getFilteredApplications: () => Application[]
}

export const useAppStore = create<AppState>((set, get) => ({
  applications: [],
  tasks: [],
  interviews: [],
  selectedView: 'board',
  filterStatus: null,
  filterPriority: null,
  filterWorkType: null,
  searchQuery: '',
  setApplications: (applications) => set({ applications }),
  setTasks: (tasks) => set({ tasks }),
  setInterviews: (interviews) => set({ interviews }),
  setSelectedView: (view) => set({ selectedView: view }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterWorkType: (workType) => set({ filterWorkType: workType }),
  setSearchQuery: (query) => set({ searchQuery: query }),
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
  addInterview: (interview) =>
    set((state) => ({ interviews: [...state.interviews, interview] })),
  updateInterview: (id, updates) =>
    set((state) => ({
      interviews: state.interviews.map((interview) =>
        interview.id === id ? { ...interview, ...updates } : interview
      ),
    })),
  deleteInterview: (id) =>
    set((state) => ({
      interviews: state.interviews.filter((interview) => interview.id !== id),
    })),
  getFilteredApplications: () => {
    const state = get()
    let filtered = [...state.applications]

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (app) =>
          app.company.toLowerCase().includes(query) ||
          app.role.toLowerCase().includes(query) ||
          (app.location && app.location.toLowerCase().includes(query)) ||
          (app.tags && app.tags.some((tag) => tag.toLowerCase().includes(query)))
      )
    }

    // Apply status filter
    if (state.filterStatus) {
      filtered = filtered.filter((app) => app.status === state.filterStatus)
    }

    // Apply priority filter
    if (state.filterPriority) {
      filtered = filtered.filter((app) => app.priority === state.filterPriority)
    }

    // Apply work type filter
    if (state.filterWorkType) {
      filtered = filtered.filter((app) => app.work_type === state.filterWorkType)
    }

    return filtered
  },
}))
