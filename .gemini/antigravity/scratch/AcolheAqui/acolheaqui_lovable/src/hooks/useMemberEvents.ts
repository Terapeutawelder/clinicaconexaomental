import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MemberEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  eventTime: string;
  durationMinutes: number;
  eventType: string;
  meetingUrl: string | null;
  maxParticipants: number | null;
  isPublished: boolean;
  createdAt: string;
  registrationsCount: number;
}

export const useMemberEvents = (professionalId: string | null) => {
  const [events, setEvents] = useState<MemberEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!professionalId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: eventsData, error } = await supabase
        .from("member_events")
        .select("*")
        .eq("professional_id", professionalId)
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true });

      if (error) throw error;

      // Get registrations count for each event
      const eventIds = (eventsData || []).map(e => e.id);
      const { data: registrations } = await supabase
        .from("member_event_registrations")
        .select("event_id")
        .in("event_id", eventIds);

      const registrationCounts: Record<string, number> = {};
      (registrations || []).forEach(r => {
        registrationCounts[r.event_id] = (registrationCounts[r.event_id] || 0) + 1;
      });

      const formattedEvents: MemberEvent[] = (eventsData || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.event_date,
        eventTime: event.event_time,
        durationMinutes: event.duration_minutes || 60,
        eventType: event.event_type || "live",
        meetingUrl: event.meeting_url,
        maxParticipants: event.max_participants,
        isPublished: event.is_published ?? true,
        createdAt: event.created_at,
        registrationsCount: registrationCounts[event.id] || 0,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (data: {
    title: string;
    description?: string;
    eventDate: string;
    eventTime: string;
    durationMinutes: number;
    eventType: string;
    meetingUrl?: string;
    maxParticipants?: number;
    isPublished?: boolean;
  }) => {
    if (!professionalId) return;

    try {
      const { error } = await supabase
        .from("member_events")
        .insert({
          professional_id: professionalId,
          title: data.title,
          description: data.description || null,
          event_date: data.eventDate,
          event_time: data.eventTime,
          duration_minutes: data.durationMinutes,
          event_type: data.eventType,
          meeting_url: data.meetingUrl || null,
          max_participants: data.maxParticipants || null,
          is_published: data.isPublished ?? true,
        });

      if (error) throw error;
      await fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  };

  const updateEvent = async (eventId: string, data: Partial<{
    title: string;
    description: string;
    eventDate: string;
    eventTime: string;
    durationMinutes: number;
    eventType: string;
    meetingUrl: string;
    maxParticipants: number;
    isPublished: boolean;
  }>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.eventDate !== undefined) updateData.event_date = data.eventDate;
      if (data.eventTime !== undefined) updateData.event_time = data.eventTime;
      if (data.durationMinutes !== undefined) updateData.duration_minutes = data.durationMinutes;
      if (data.eventType !== undefined) updateData.event_type = data.eventType;
      if (data.meetingUrl !== undefined) updateData.meeting_url = data.meetingUrl;
      if (data.maxParticipants !== undefined) updateData.max_participants = data.maxParticipants;
      if (data.isPublished !== undefined) updateData.is_published = data.isPublished;

      const { error } = await supabase
        .from("member_events")
        .update(updateData)
        .eq("id", eventId);

      if (error) throw error;
      await fetchEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("member_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      await fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  return {
    events,
    loading,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
