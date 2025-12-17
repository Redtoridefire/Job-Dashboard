export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string
          user_id: string
          company: string
          role: string
          location: string | null
          work_type: 'remote' | 'hybrid' | 'onsite' | null
          salary_min: number | null
          salary_max: number | null
          job_url: string | null
          job_description: string | null
          priority: 'A' | 'B' | 'C' | 'Dream'
          status: 'new' | 'submitted' | 'interviewing' | 'offer' | 'accepted' | 'rejected'
          tags: string[] | null
          referral_name: string | null
          hiring_manager: string | null
          notes: string | null
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company: string
          role: string
          location?: string | null
          work_type?: 'remote' | 'hybrid' | 'onsite' | null
          salary_min?: number | null
          salary_max?: number | null
          job_url?: string | null
          job_description?: string | null
          priority?: 'A' | 'B' | 'C' | 'Dream'
          status?: 'new' | 'submitted' | 'interviewing' | 'offer' | 'accepted' | 'rejected'
          tags?: string[] | null
          referral_name?: string | null
          hiring_manager?: string | null
          notes?: string | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string
          role?: string
          location?: string | null
          work_type?: 'remote' | 'hybrid' | 'onsite' | null
          salary_min?: number | null
          salary_max?: number | null
          job_url?: string | null
          job_description?: string | null
          priority?: 'A' | 'B' | 'C' | 'Dream'
          status?: 'new' | 'submitted' | 'interviewing' | 'offer' | 'accepted' | 'rejected'
          tags?: string[] | null
          referral_name?: string | null
          hiring_manager?: string | null
          notes?: string | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          name: string
          version: string | null
          file_path: string
          file_type: string
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          version?: string | null
          file_path: string
          file_type: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          version?: string | null
          file_path?: string
          file_type?: string
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          application_id: string | null
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          application_id?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string | null
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          application_id: string
          interview_date: string
          interview_type: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'panel' | null
          interviewer_names: string[] | null
          notes: string | null
          feedback: string | null
          score: number | null
          google_calendar_event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          interview_date: string
          interview_type?: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'panel' | null
          interviewer_names?: string[] | null
          notes?: string | null
          feedback?: string | null
          score?: number | null
          google_calendar_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          interview_date?: string
          interview_type?: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'panel' | null
          interviewer_names?: string[] | null
          notes?: string | null
          feedback?: string | null
          score?: number | null
          google_calendar_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          application_id: string
          base_salary: number
          bonus: number | null
          equity: string | null
          pto_days: number | null
          benefits_summary: string | null
          start_date: string | null
          deadline: string | null
          notes: string | null
          accepted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          base_salary: number
          bonus?: number | null
          equity?: string | null
          pto_days?: number | null
          benefits_summary?: string | null
          start_date?: string | null
          deadline?: string | null
          notes?: string | null
          accepted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          base_salary?: number
          bonus?: number | null
          equity?: string | null
          pto_days?: number | null
          benefits_summary?: string | null
          start_date?: string | null
          deadline?: string | null
          notes?: string | null
          accepted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
