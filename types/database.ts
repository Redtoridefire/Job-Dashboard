export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        Relationships: []
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'tasks_application_id_fkey'
            columns: ['application_id']
            isOneToOne: false
            referencedRelation: 'applications'
            referencedColumns: ['id']
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: 'interviews_application_id_fkey'
            columns: ['application_id']
            isOneToOne: false
            referencedRelation: 'applications'
            referencedColumns: ['id']
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: 'offers_application_id_fkey'
            columns: ['application_id']
            isOneToOne: false
            referencedRelation: 'applications'
            referencedColumns: ['id']
          }
        ]
      }
      user_integrations: {
        Row: {
          id: string
          user_id: string
          provider: 'google_calendar' | 'telegram'
          access_token: string | null
          refresh_token: string | null
          expires_at: string | null
          connected: boolean
          settings: {
            syncInterviews?: boolean
            syncDeadlines?: boolean
            chatId?: string
            notifications?: {
              interviews?: boolean
              deadlines?: boolean
              statusChanges?: boolean
            }
          } | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'google_calendar' | 'telegram'
          access_token?: string | null
          refresh_token?: string | null
          expires_at?: string | null
          connected?: boolean
          settings?: {
            syncInterviews?: boolean
            syncDeadlines?: boolean
            chatId?: string
            notifications?: {
              interviews?: boolean
              deadlines?: boolean
              statusChanges?: boolean
            }
          } | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'google_calendar' | 'telegram'
          access_token?: string | null
          refresh_token?: string | null
          expires_at?: string | null
          connected?: boolean
          settings?: {
            syncInterviews?: boolean
            syncDeadlines?: boolean
            chatId?: string
            notifications?: {
              interviews?: boolean
              deadlines?: boolean
              statusChanges?: boolean
            }
          } | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
