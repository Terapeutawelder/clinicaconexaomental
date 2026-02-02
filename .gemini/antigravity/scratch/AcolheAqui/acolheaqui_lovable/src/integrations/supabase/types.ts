export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      ai_agent_config: {
        Row: {
          agent_greeting: string | null
          agent_instructions: string | null
          agent_name: string | null
          anthropic_api_key: string | null
          anthropic_preferred_model: string | null
          auto_confirm_appointments: boolean | null
          created_at: string
          google_api_key: string | null
          google_preferred_model: string | null
          id: string
          is_active: boolean | null
          n8n_api_key: string | null
          n8n_webhook_url: string | null
          openai_api_key: string | null
          openai_preferred_model: string | null
          preferred_ai_provider: string | null
          professional_id: string
          send_confirmation_message: boolean | null
          updated_at: string
          working_hours_only: boolean | null
        }
        Insert: {
          agent_greeting?: string | null
          agent_instructions?: string | null
          agent_name?: string | null
          anthropic_api_key?: string | null
          anthropic_preferred_model?: string | null
          auto_confirm_appointments?: boolean | null
          created_at?: string
          google_api_key?: string | null
          google_preferred_model?: string | null
          id?: string
          is_active?: boolean | null
          n8n_api_key?: string | null
          n8n_webhook_url?: string | null
          openai_api_key?: string | null
          openai_preferred_model?: string | null
          preferred_ai_provider?: string | null
          professional_id: string
          send_confirmation_message?: boolean | null
          updated_at?: string
          working_hours_only?: boolean | null
        }
        Update: {
          agent_greeting?: string | null
          agent_instructions?: string | null
          agent_name?: string | null
          anthropic_api_key?: string | null
          anthropic_preferred_model?: string | null
          auto_confirm_appointments?: boolean | null
          created_at?: string
          google_api_key?: string | null
          google_preferred_model?: string | null
          id?: string
          is_active?: boolean | null
          n8n_api_key?: string | null
          n8n_webhook_url?: string | null
          openai_api_key?: string | null
          openai_preferred_model?: string | null
          preferred_ai_provider?: string | null
          professional_id?: string
          send_confirmation_message?: boolean | null
          updated_at?: string
          working_hours_only?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_config_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_config_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_access_tokens: {
        Row: {
          appointment_id: string
          client_email: string
          created_at: string
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          appointment_id: string
          client_email: string
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Update: {
          appointment_id?: string
          client_email?: string
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_access_tokens_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          ai_psi_analysis: string | null
          amount_cents: number | null
          appointment_date: string
          appointment_time: string
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          professional_id: string
          recording_url: string | null
          session_type: string | null
          status: string | null
          transcription: Json | null
          updated_at: string
          virtual_room_code: string | null
          virtual_room_link: string | null
        }
        Insert: {
          ai_psi_analysis?: string | null
          amount_cents?: number | null
          appointment_date: string
          appointment_time: string
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          professional_id: string
          recording_url?: string | null
          session_type?: string | null
          status?: string | null
          transcription?: Json | null
          updated_at?: string
          virtual_room_code?: string | null
          virtual_room_link?: string | null
        }
        Update: {
          ai_psi_analysis?: string | null
          amount_cents?: number | null
          appointment_date?: string
          appointment_time?: string
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          professional_id?: string
          recording_url?: string | null
          session_type?: string | null
          status?: string | null
          transcription?: Json | null
          updated_at?: string
          virtual_room_code?: string | null
          virtual_room_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      available_hours: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          professional_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          professional_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          professional_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "available_hours_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "available_hours_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string | null
          discount_amount_cents: number
          id: string
          professional_id: string
          subscription_id: string | null
          used_at: string
        }
        Insert: {
          coupon_id?: string | null
          discount_amount_cents: number
          id?: string
          professional_id: string
          subscription_id?: string | null
          used_at?: string
        }
        Update: {
          coupon_id?: string | null
          discount_amount_cents?: number
          id?: string
          professional_id?: string
          subscription_id?: string | null
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "subscription_coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_domains: {
        Row: {
          cloudflare_api_token: string | null
          cloudflare_zone_id: string | null
          created_at: string
          dns_verified: boolean | null
          dns_verified_at: string | null
          domain: string
          id: string
          is_primary: boolean | null
          notification_whatsapp: string | null
          parent_domain_id: string | null
          professional_id: string
          redirect_to: string | null
          ssl_provisioned_at: string | null
          ssl_status: string | null
          status: string
          updated_at: string
          verification_token: string
        }
        Insert: {
          cloudflare_api_token?: string | null
          cloudflare_zone_id?: string | null
          created_at?: string
          dns_verified?: boolean | null
          dns_verified_at?: string | null
          domain: string
          id?: string
          is_primary?: boolean | null
          notification_whatsapp?: string | null
          parent_domain_id?: string | null
          professional_id: string
          redirect_to?: string | null
          ssl_provisioned_at?: string | null
          ssl_status?: string | null
          status?: string
          updated_at?: string
          verification_token?: string
        }
        Update: {
          cloudflare_api_token?: string | null
          cloudflare_zone_id?: string | null
          created_at?: string
          dns_verified?: boolean | null
          dns_verified_at?: string | null
          domain?: string
          id?: string
          is_primary?: boolean | null
          notification_whatsapp?: string | null
          parent_domain_id?: string | null
          professional_id?: string
          redirect_to?: string | null
          ssl_provisioned_at?: string | null
          ssl_status?: string | null
          status?: string
          updated_at?: string
          verification_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_parent_domain_id_fkey"
            columns: ["parent_domain_id"]
            isOneToOne: false
            referencedRelation: "custom_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_domains_parent_domain_id_fkey"
            columns: ["parent_domain_id"]
            isOneToOne: false
            referencedRelation: "public_active_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      google_calendar_settings: {
        Row: {
          access_token: string | null
          auto_create_meet: boolean | null
          calendar_id: string | null
          created_at: string
          google_email: string | null
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          professional_id: string
          refresh_token: string | null
          sync_direction: string | null
          sync_enabled: boolean | null
          token_expires_at: string | null
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          auto_create_meet?: boolean | null
          calendar_id?: string | null
          created_at?: string
          google_email?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          professional_id: string
          refresh_token?: string | null
          sync_direction?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          auto_create_meet?: boolean | null
          calendar_id?: string | null
          created_at?: string
          google_email?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          professional_id?: string
          refresh_token?: string | null
          sync_direction?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      landing_page_config: {
        Row: {
          config: Json
          created_at: string
          id: string
          professional_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          professional_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          professional_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_page_config_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "landing_page_config_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_access: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          professional_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          professional_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          professional_id?: string
          user_id?: string
        }
        Relationships: []
      }
      member_community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "member_community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      member_community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          professional_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          professional_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          professional_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_community_posts_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_community_posts_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_event_registrations: {
        Row: {
          attended: boolean | null
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "member_events"
            referencedColumns: ["id"]
          },
        ]
      }
      member_events: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          event_date: string
          event_time: string
          event_type: string | null
          id: string
          is_published: boolean | null
          max_participants: number | null
          meeting_url: string | null
          professional_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          event_date: string
          event_time: string
          event_type?: string | null
          id?: string
          is_published?: boolean | null
          max_participants?: number | null
          meeting_url?: string | null
          professional_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          event_date?: string
          event_time?: string
          event_type?: string | null
          id?: string
          is_published?: boolean | null
          max_participants?: number | null
          meeting_url?: string | null
          professional_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_events_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_events_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_lessons: {
        Row: {
          attachments: Json | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_free: boolean | null
          module_id: string
          order_index: number | null
          professional_id: string
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_free?: boolean | null
          module_id: string
          order_index?: number | null
          professional_id: string
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_free?: boolean | null
          module_id?: string
          order_index?: number | null
          professional_id?: string
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "member_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      member_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          professional_id: string
          thumbnail_focus: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          professional_id: string
          thumbnail_focus?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          professional_id?: string
          thumbnail_focus?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      member_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          last_watched_at: string | null
          lesson_id: string
          professional_id: string
          progress_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          lesson_id: string
          professional_id: string
          progress_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          lesson_id?: string
          professional_id?: string
          progress_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "member_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_records: {
        Row: {
          allergies: string | null
          chief_complaint: string | null
          created_at: string
          diagnosis: string | null
          id: string
          medical_history: string | null
          medications: Json | null
          patient_email: string
          patient_name: string
          professional_id: string
          risk_level: string | null
          treatment_plan: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          medical_history?: string | null
          medications?: Json | null
          patient_email: string
          patient_name: string
          professional_id: string
          risk_level?: string | null
          treatment_plan?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          chief_complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          id?: string
          medical_history?: string | null
          medications?: Json | null
          patient_email?: string
          patient_name?: string
          professional_id?: string
          risk_level?: string | null
          treatment_plan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          card_api_key: string | null
          card_enabled: boolean | null
          card_gateway: string | null
          created_at: string
          gateway_type: string
          id: string
          installments_enabled: boolean | null
          is_active: boolean | null
          max_installments: number | null
          pix_key: string | null
          pix_key_type: string | null
          professional_id: string
          updated_at: string
        }
        Insert: {
          card_api_key?: string | null
          card_enabled?: boolean | null
          card_gateway?: string | null
          created_at?: string
          gateway_type: string
          id?: string
          installments_enabled?: boolean | null
          is_active?: boolean | null
          max_installments?: number | null
          pix_key?: string | null
          pix_key_type?: string | null
          professional_id: string
          updated_at?: string
        }
        Update: {
          card_api_key?: string | null
          card_enabled?: boolean | null
          card_gateway?: string | null
          created_at?: string
          gateway_type?: string
          id?: string
          installments_enabled?: boolean | null
          is_active?: boolean | null
          max_installments?: number | null
          pix_key?: string | null
          pix_key_type?: string | null
          professional_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_gateways_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_gateways_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approaches: string[] | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          crp: string | null
          email: string | null
          facebook_url: string | null
          full_name: string | null
          gender: string | null
          id: string
          instagram_url: string | null
          is_demo: boolean | null
          is_professional: boolean | null
          is_verified: boolean | null
          linkedin_url: string | null
          phone: string | null
          professional_status: string | null
          resume_url: string | null
          specialties: string[] | null
          specialty: string | null
          subscription_expires_at: string | null
          subscription_plan: string | null
          subscription_status: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string | null
          user_slug: string | null
          verified_at: string | null
          whatsapp_number: string | null
          youtube_url: string | null
        }
        Insert: {
          approaches?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          crp?: string | null
          email?: string | null
          facebook_url?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          instagram_url?: string | null
          is_demo?: boolean | null
          is_professional?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          professional_status?: string | null
          resume_url?: string | null
          specialties?: string[] | null
          specialty?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
          user_slug?: string | null
          verified_at?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Update: {
          approaches?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          crp?: string | null
          email?: string | null
          facebook_url?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          instagram_url?: string | null
          is_demo?: boolean | null
          is_professional?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          professional_status?: string | null
          resume_url?: string | null
          specialties?: string[] | null
          specialty?: string | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string | null
          user_slug?: string | null
          verified_at?: string | null
          whatsapp_number?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      sales_page_config: {
        Row: {
          config: Json
          created_at: string
          id: string
          professional_id: string
          service_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          professional_id: string
          service_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          professional_id?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_page_config_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_page_config_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_page_config_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "public_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_page_config_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          checkout_config: Json
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          member_access_config: Json | null
          name: string
          price_cents: number
          product_config: Json
          professional_id: string
          service_type: string
          updated_at: string
        }
        Insert: {
          checkout_config?: Json
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          member_access_config?: Json | null
          name: string
          price_cents: number
          product_config?: Json
          professional_id: string
          service_type?: string
          updated_at?: string
        }
        Update: {
          checkout_config?: Json
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          member_access_config?: Json | null
          name?: string
          price_cents?: number
          product_config?: Json
          professional_id?: string
          service_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_coupons: {
        Row: {
          applicable_billing_cycles: string[] | null
          applicable_plans: string[] | null
          code: string
          created_at: string
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_amount_cents: number | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_billing_cycles?: string[] | null
          applicable_plans?: string[] | null
          code: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount_cents?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_billing_cycles?: string[] | null
          applicable_plans?: string[] | null
          code?: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_amount_cents?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      subscription_payments: {
        Row: {
          amount_cents: number
          created_at: string
          gateway: string
          gateway_payment_id: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          professional_id: string
          status: string
          subscription_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          gateway: string
          gateway_payment_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          professional_id: string
          status?: string
          subscription_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          gateway?: string
          gateway_payment_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          professional_id?: string
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_payments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          badge_text: string | null
          created_at: string
          cta_color: string | null
          cta_text: string | null
          cta_text_color: string | null
          description: string | null
          display_order: number | null
          facebook_pixel_id: string | null
          features: Json | null
          google_analytics_id: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          price_annual_cents: number | null
          price_annual_enabled: boolean | null
          price_monthly_cents: number
          price_monthly_enabled: boolean | null
          price_semiannual_cents: number | null
          price_semiannual_enabled: boolean | null
          slug: string
          tracking_events: Json | null
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          created_at?: string
          cta_color?: string | null
          cta_text?: string | null
          cta_text_color?: string | null
          description?: string | null
          display_order?: number | null
          facebook_pixel_id?: string | null
          features?: Json | null
          google_analytics_id?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          price_annual_cents?: number | null
          price_annual_enabled?: boolean | null
          price_monthly_cents?: number
          price_monthly_enabled?: boolean | null
          price_semiannual_cents?: number | null
          price_semiannual_enabled?: boolean | null
          slug: string
          tracking_events?: Json | null
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          created_at?: string
          cta_color?: string | null
          cta_text?: string | null
          cta_text_color?: string | null
          description?: string | null
          display_order?: number | null
          facebook_pixel_id?: string | null
          features?: Json | null
          google_analytics_id?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          price_annual_cents?: number | null
          price_annual_enabled?: boolean | null
          price_monthly_cents?: number
          price_monthly_enabled?: boolean | null
          price_semiannual_cents?: number | null
          price_semiannual_enabled?: boolean | null
          slug?: string
          tracking_events?: Json | null
          trial_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number | null
          billing_cycle: string | null
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          gateway: string | null
          gateway_customer_id: string | null
          gateway_subscription_id: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          professional_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          gateway?: string | null
          gateway_customer_id?: string | null
          gateway_subscription_id?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          professional_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          gateway?: string | null
          gateway_customer_id?: string | null
          gateway_subscription_id?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          professional_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          client_avatar_url: string | null
          client_name: string
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          professional_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          client_avatar_url?: string | null
          client_name: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          professional_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          client_avatar_url?: string | null
          client_name?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          professional_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_cents: number
          created_at: string
          customer_cpf: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          gateway: string
          gateway_payment_id: string | null
          gateway_response: Json | null
          id: string
          payment_method: string
          payment_status: string
          pix_code: string | null
          pix_qr_code: string | null
          professional_id: string
          service_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          customer_cpf?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          gateway?: string
          gateway_payment_id?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method: string
          payment_status?: string
          pix_code?: string | null
          pix_qr_code?: string | null
          professional_id: string
          service_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          gateway?: string
          gateway_payment_id?: string | null
          gateway_response?: Json | null
          id?: string
          payment_method?: string
          payment_status?: string
          pix_code?: string | null
          pix_qr_code?: string | null
          professional_id?: string
          service_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "public_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      virtual_rooms: {
        Row: {
          answer: Json | null
          created_at: string
          expires_at: string
          id: string
          offer: Json | null
          patient_name: string | null
          professional_id: string
          room_code: string
          status: string | null
          updated_at: string
        }
        Insert: {
          answer?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          offer?: Json | null
          patient_name?: string | null
          professional_id: string
          room_code: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          answer?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          offer?: Json | null
          patient_name?: string | null
          professional_id?: string
          room_code?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string
          events: Json
          id: string
          is_active: boolean | null
          professional_id: string
          secret_token: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          events?: Json
          id?: string
          is_active?: boolean | null
          professional_id: string
          secret_token?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: Json
          id?: string
          is_active?: boolean | null
          professional_id?: string
          secret_token?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhooks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_ai_agents: {
        Row: {
          avatar_color: string | null
          avatar_icon: string | null
          connection_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          knowledge_base: Json | null
          name: string
          professional_id: string
          settings: Json | null
          system_prompt: string | null
          updated_at: string
        }
        Insert: {
          avatar_color?: string | null
          avatar_icon?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          knowledge_base?: Json | null
          name: string
          professional_id: string
          settings?: Json | null
          system_prompt?: string | null
          updated_at?: string
        }
        Update: {
          avatar_color?: string | null
          avatar_icon?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          knowledge_base?: Json | null
          name?: string
          professional_id?: string
          settings?: Json | null
          system_prompt?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_ai_agents_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_ai_agents_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_ai_agents_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_connections: {
        Row: {
          access_token: string | null
          avatar_url: string | null
          created_at: string
          driver_type: string
          id: string
          last_connected_at: string | null
          name: string
          phone_number: string | null
          phone_number_id: string | null
          professional_id: string
          qr_code: string | null
          session_data: Json | null
          status: string
          updated_at: string
          waba_id: string | null
        }
        Insert: {
          access_token?: string | null
          avatar_url?: string | null
          created_at?: string
          driver_type?: string
          id?: string
          last_connected_at?: string | null
          name: string
          phone_number?: string | null
          phone_number_id?: string | null
          professional_id: string
          qr_code?: string | null
          session_data?: Json | null
          status?: string
          updated_at?: string
          waba_id?: string | null
        }
        Update: {
          access_token?: string | null
          avatar_url?: string | null
          created_at?: string
          driver_type?: string
          id?: string
          last_connected_at?: string | null
          name?: string
          phone_number?: string | null
          phone_number_id?: string | null
          professional_id?: string
          qr_code?: string | null
          session_data?: Json | null
          status?: string
          updated_at?: string
          waba_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_connections_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_connections_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_crm_leads: {
        Row: {
          connection_id: string | null
          created_at: string
          id: string
          is_scheduled: boolean | null
          last_interaction_at: string | null
          name: string
          notes: string | null
          phone: string
          professional_id: string
          scheduled_date: string | null
          scheduled_time: string | null
          stage_id: string
          tags: string[] | null
          updated_at: string
          value_cents: number | null
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          id?: string
          is_scheduled?: boolean | null
          last_interaction_at?: string | null
          name: string
          notes?: string | null
          phone: string
          professional_id: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          stage_id: string
          tags?: string[] | null
          updated_at?: string
          value_cents?: number | null
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          id?: string
          is_scheduled?: boolean | null
          last_interaction_at?: string | null
          name?: string
          notes?: string | null
          phone?: string
          professional_id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          stage_id?: string
          tags?: string[] | null
          updated_at?: string
          value_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_crm_leads_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_crm_leads_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_crm_leads_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_crm_leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_crm_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_crm_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          order_index: number
          professional_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          order_index?: number
          professional_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          order_index?: number
          professional_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_crm_stages_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_crm_stages_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_dispatch_config: {
        Row: {
          active_days: number[] | null
          connection_id: string | null
          created_at: string
          delay_max_seconds: number | null
          delay_min_seconds: number | null
          end_time: string | null
          id: string
          pause_after_messages: number | null
          pause_minutes: number | null
          professional_id: string
          schedule_enabled: boolean | null
          scheduled_at: string | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          active_days?: number[] | null
          connection_id?: string | null
          created_at?: string
          delay_max_seconds?: number | null
          delay_min_seconds?: number | null
          end_time?: string | null
          id?: string
          pause_after_messages?: number | null
          pause_minutes?: number | null
          professional_id: string
          schedule_enabled?: boolean | null
          scheduled_at?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          active_days?: number[] | null
          connection_id?: string | null
          created_at?: string
          delay_max_seconds?: number | null
          delay_min_seconds?: number | null
          end_time?: string | null
          id?: string
          pause_after_messages?: number | null
          pause_minutes?: number | null
          professional_id?: string
          schedule_enabled?: boolean | null
          scheduled_at?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_dispatch_config_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_dispatch_config_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_dispatch_config_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_dispatches: {
        Row: {
          completed_at: string | null
          connection_id: string
          created_at: string
          failed_count: number | null
          id: string
          media_type: string | null
          media_url: string | null
          message_content: string
          name: string
          professional_id: string
          recipients: Json | null
          scheduled_at: string | null
          sent_count: number | null
          started_at: string | null
          status: string | null
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          connection_id: string
          created_at?: string
          failed_count?: number | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          message_content: string
          name: string
          professional_id: string
          recipients?: Json | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          connection_id?: string
          created_at?: string
          failed_count?: number | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          message_content?: string
          name?: string
          professional_id?: string
          recipients?: Json | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_dispatches_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_dispatches_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_dispatches_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          connection_id: string
          content: string
          created_at: string
          direction: string
          id: string
          lead_id: string | null
          media_type: string | null
          media_url: string | null
          phone: string
          professional_id: string
          sent_at: string
          status: string | null
        }
        Insert: {
          connection_id: string
          content: string
          created_at?: string
          direction: string
          id?: string
          lead_id?: string | null
          media_type?: string | null
          media_url?: string | null
          phone: string
          professional_id: string
          sent_at?: string
          status?: string | null
        }
        Update: {
          connection_id?: string
          content?: string
          created_at?: string
          direction?: string
          id?: string
          lead_id?: string | null
          media_type?: string | null
          media_url?: string | null
          phone?: string
          professional_id?: string
          sent_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_settings: {
        Row: {
          confirmation_enabled: boolean | null
          created_at: string
          evolution_api_key: string | null
          evolution_api_url: string | null
          evolution_instance_name: string | null
          id: string
          is_active: boolean | null
          official_access_token: string | null
          official_business_account_id: string | null
          official_phone_number_id: string | null
          professional_id: string
          reminder_enabled: boolean | null
          reminder_hours_before: number | null
          template_client_confirmation: string | null
          template_client_reminder: string | null
          template_email_confirmation: string | null
          template_professional_notification: string | null
          updated_at: string
          whatsapp_api_type: string | null
        }
        Insert: {
          confirmation_enabled?: boolean | null
          created_at?: string
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance_name?: string | null
          id?: string
          is_active?: boolean | null
          official_access_token?: string | null
          official_business_account_id?: string | null
          official_phone_number_id?: string | null
          professional_id: string
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          template_client_confirmation?: string | null
          template_client_reminder?: string | null
          template_email_confirmation?: string | null
          template_professional_notification?: string | null
          updated_at?: string
          whatsapp_api_type?: string | null
        }
        Update: {
          confirmation_enabled?: boolean | null
          created_at?: string
          evolution_api_key?: string | null
          evolution_api_url?: string | null
          evolution_instance_name?: string | null
          id?: string
          is_active?: boolean | null
          official_access_token?: string | null
          official_business_account_id?: string | null
          official_phone_number_id?: string | null
          professional_id?: string
          reminder_enabled?: boolean | null
          reminder_hours_before?: number | null
          template_client_confirmation?: string | null
          template_client_reminder?: string | null
          template_email_confirmation?: string | null
          template_professional_notification?: string | null
          updated_at?: string
          whatsapp_api_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_settings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_settings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: true
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whitelabel_plans: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          price_annual_cents: number | null
          price_monthly_cents: number
          price_semiannual_cents: number | null
          slug: string
          updated_at: string
          whitelabel_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          price_annual_cents?: number | null
          price_monthly_cents?: number
          price_semiannual_cents?: number | null
          slug: string
          updated_at?: string
          whitelabel_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_annual_cents?: number | null
          price_monthly_cents?: number
          price_semiannual_cents?: number | null
          slug?: string
          updated_at?: string
          whitelabel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whitelabel_plans_whitelabel_id_fkey"
            columns: ["whitelabel_id"]
            isOneToOne: false
            referencedRelation: "whitelabels"
            referencedColumns: ["id"]
          },
        ]
      }
      whitelabel_professionals: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          professional_id: string
          role: string | null
          whitelabel_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          professional_id: string
          role?: string | null
          whitelabel_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          professional_id?: string
          role?: string | null
          whitelabel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whitelabel_professionals_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whitelabel_professionals_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whitelabel_professionals_whitelabel_id_fkey"
            columns: ["whitelabel_id"]
            isOneToOne: false
            referencedRelation: "whitelabels"
            referencedColumns: ["id"]
          },
        ]
      }
      whitelabels: {
        Row: {
          created_at: string
          custom_domain: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_active_domains: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string | null
          is_primary: boolean | null
          professional_id: string | null
          ssl_status: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string | null
          is_primary?: boolean | null
          professional_id?: string | null
          ssl_status?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string | null
          is_primary?: boolean | null
          professional_id?: string | null
          ssl_status?: string | null
        }
        Relationships: []
      }
      public_professional_profiles: {
        Row: {
          approaches: string[] | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          crp: string | null
          full_name: string | null
          gender: string | null
          id: string | null
          is_professional: boolean | null
          is_verified: boolean | null
          professional_status: string | null
          specialties: string[] | null
          specialty: string | null
          user_slug: string | null
          verified_at: string | null
        }
        Insert: {
          approaches?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          crp?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          is_professional?: boolean | null
          is_verified?: boolean | null
          professional_status?: string | null
          specialties?: string[] | null
          specialty?: string | null
          user_slug?: string | null
          verified_at?: string | null
        }
        Update: {
          approaches?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          crp?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          is_professional?: boolean | null
          is_verified?: boolean | null
          professional_status?: string | null
          specialties?: string[] | null
          specialty?: string | null
          user_slug?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      public_services: {
        Row: {
          checkout_config: Json | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string | null
          is_active: boolean | null
          name: string | null
          price_cents: number | null
          product_config: Json | null
          professional_id: string | null
        }
        Insert: {
          checkout_config?: Json | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          price_cents?: number | null
          product_config?: Json | null
          professional_id?: string | null
        }
        Update: {
          checkout_config?: Json | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          price_cents?: number | null
          product_config?: Json | null
          professional_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "public_professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_slug_available: {
        Args: { profile_id?: string; slug: string }
        Returns: boolean
      }
      generate_unique_slug: {
        Args: { base_name: string; exclude_profile_id?: string }
        Returns: string
      }
      get_professional_contact: {
        Args: { professional_id: string }
        Returns: {
          email: string
          phone: string
        }[]
      }
      get_user_whitelabel: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_whitelabel_admin: {
        Args: { _user_id: string; _whitelabel_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user" | "whitelabel_admin"
      subscription_plan: "free" | "pro" | "premium"
      subscription_status:
        | "active"
        | "cancelled"
        | "past_due"
        | "trialing"
        | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "user", "whitelabel_admin"],
      subscription_plan: ["free", "pro", "premium"],
      subscription_status: [
        "active",
        "cancelled",
        "past_due",
        "trialing",
        "expired",
      ],
    },
  },
} as const
