import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseAppointmentNotificationsProps {
  profileId: string | null;
  enabled?: boolean;
}

export const useAppointmentNotifications = ({ 
  profileId, 
  enabled = true 
}: UseAppointmentNotificationsProps) => {
  const lastNotifiedIdRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play notification sound using Web Audio API
  const playNotificationSound = useCallback(() => {
    try {
      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      
      // Resume audio context if suspended (browser policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create a pleasant notification sound (two-tone chime)
      const now = ctx.currentTime;
      
      // First tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.type = 'sine';
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Second tone (higher, delayed)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(1318.5, now + 0.15); // E6
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);

      // Third tone (highest, final chime)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.frequency.setValueAtTime(1760, now + 0.3); // A6
      osc3.type = 'sine';
      gain3.gain.setValueAtTime(0, now);
      gain3.gain.setValueAtTime(0.2, now + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      osc3.start(now + 0.3);
      osc3.stop(now + 0.7);

      console.log("🔔 Notification sound played");
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }, []);

  useEffect(() => {
    if (!profileId || !enabled) return;

    console.log("📡 Setting up realtime appointment notifications for:", profileId);

    // Subscribe to new appointments for this professional
    const channel = supabase
      .channel('appointment-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `professional_id=eq.${profileId}`,
        },
        (payload) => {
          console.log("🆕 New appointment received:", payload);
          
          const newAppointment = payload.new as any;
          
          // Avoid duplicate notifications
          if (lastNotifiedIdRef.current === newAppointment.id) {
            return;
          }
          lastNotifiedIdRef.current = newAppointment.id;
          
          // Play sound
          playNotificationSound();
          
          // Show toast notification
          toast.success("🎉 Novo agendamento!", {
            description: `${newAppointment.client_name} agendou para ${new Date(newAppointment.appointment_date).toLocaleDateString('pt-BR')} às ${newAppointment.appointment_time?.slice(0, 5)}`,
            duration: 8000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `professional_id=eq.${profileId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          const old = payload.old as any;
          
          // Only notify if status changed to confirmed/completed
          if (old.status !== updated.status) {
            if (updated.status === 'confirmed' && old.status === 'pending') {
              playNotificationSound();
              toast.success("✅ Agendamento confirmado!", {
                description: `${updated.client_name} confirmou a sessão`,
                duration: 5000,
              });
            } else if (updated.status === 'completed') {
              toast.info("📋 Sessão concluída", {
                description: `Sessão com ${updated.client_name} marcada como concluída`,
                duration: 5000,
              });
            } else if (updated.status === 'cancelled') {
              toast.warning("❌ Agendamento cancelado", {
                description: `${updated.client_name} cancelou a sessão`,
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime subscription status:", status);
      });

    // Cleanup on unmount
    return () => {
      console.log("🔌 Cleaning up realtime subscription");
      supabase.removeChannel(channel);
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [profileId, enabled, playNotificationSound]);

  return { playNotificationSound };
};
