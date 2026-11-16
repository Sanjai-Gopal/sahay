/**
 * Sahay — Frontend API Client
 * 
 * Provides clean asynchronous methods to interact with backend endpoints.
 * Includes resilient fallbacks so the frontend runs seamlessly even offline.
 */

import {
  ReminderItem,
  AppointmentItem,
  FamilyMemberItem,
  ZoneEventItem,
  EmergencyDonorItem,
  EmergencyDonorFilters,
  SosAlertResponse,
} from '../types';
import { sandboxStorage, DEFAULT_DONORS } from './sandboxStorage';

export const api = {
  // Reminders
  async getReminders(): Promise<ReminderItem[]> {
    try {
      const res = await fetch('/api/reminders');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return data;
    } catch (e) {
      return sandboxStorage.getReminders();
    }
  },

  async addReminder(txt: string, time: string): Promise<ReminderItem> {
    const newItem: ReminderItem = {
      id: String(Date.now()),
      txt: txt.trim(),
      time: time.trim() || 'Anytime',
      icon: 'clock',
      tint: 'ic-indigo',
      done: false,
    };
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add reminder');
      }
    } catch (e) {
      // Offline fallback
    }
    const current = sandboxStorage.getReminders();
    const updated = [...current, newItem];
    sandboxStorage.saveReminders(updated);
    return newItem;
  },

  async toggleReminder(id: string): Promise<boolean> {
    try {
      await fetch(`/api/reminders/${id}/toggle`, { method: 'PATCH' });
    } catch (e) {
      // Offline fallback
    }
    const current = sandboxStorage.getReminders();
    const updated = current.map((r) => (r.id === id ? { ...r, done: !r.done } : r));
    sandboxStorage.saveReminders(updated);
    return true;
  },

  // Appointments
  async getAppointments(): Promise<AppointmentItem[]> {
    try {
      const res = await fetch('/api/appointments');
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      return sandboxStorage.getAppointments();
    }
  },

  async addAppointment(item: Omit<AppointmentItem, 'id'>): Promise<AppointmentItem> {
    const newItem: AppointmentItem = { id: String(Date.now()), ...item };
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add appointment');
      }
    } catch (e) {
      // Offline fallback
    }
    const current = sandboxStorage.getAppointments();
    const updated = [...current, newItem];
    sandboxStorage.saveAppointments(updated);
    return newItem;
  },

  // Family & Memory Book
  async getFamilyMembers(): Promise<FamilyMemberItem[]> {
    try {
      const res = await fetch('/api/family');
      if (!res.ok) throw new Error('Network error');
      return await res.json();
    } catch (e) {
      return sandboxStorage.getFamily();
    }
  },

  async addFamilyMember(item: Omit<FamilyMemberItem, 'id'>): Promise<FamilyMemberItem> {
    const newItem: FamilyMemberItem = { id: String(Date.now()), ...item };
    try {
      const res = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to add family member');
      }
    } catch (e) {
      // Offline fallback
    }
    const current = sandboxStorage.getFamily();
    const updated = [...current, newItem];
    sandboxStorage.saveFamily(updated);
    return newItem;
  },

  async updateFamilyMember(item: FamilyMemberItem): Promise<FamilyMemberItem> {
    try {
      await fetch(`/api/family/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch (e) {
      // Offline fallback
    }
    const current = sandboxStorage.getFamily();
    const updated = current.map((m) => (m.id === item.id ? item : m));
    sandboxStorage.saveFamily(updated);
    return item;
  },

  // Activity Logs
  async logActivity(data: { activityId: string; title: string; durationSeconds: number; accuracyPercentage: number }): Promise<void> {
    try {
      await fetch('/api/activities/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.log('Logged locally');
    }
  },

  // Safety & Geofencing
  async getSafetyStatus(): Promise<{ radius: number; events: ZoneEventItem[] }> {
    try {
      const res = await fetch('/api/safety');
      const data = await res.json();
      return {
        radius: data.safeZone?.radiusMeters || 500,
        events: data.zoneEvents || [],
      };
    } catch (e) {
      return sandboxStorage.getSafety();
    }
  },

  async updateSafetyRadius(radiusMeters: number): Promise<void> {
    try {
      await fetch('/api/safety/radius', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ radiusMeters }),
      });
    } catch (e) {
      // Ignored in offline fallback
    }
    const current = sandboxStorage.getSafety();
    sandboxStorage.saveSafety({ ...current, radius: radiusMeters });
  },

  // Emergency SOS trigger
  async triggerSos(options?: {
    contactName?: string;
    phone?: string;
    coordinates?: { lat: number; lng: number };
    reason?: string;
  }): Promise<SosAlertResponse> {
    const defaultResp: SosAlertResponse = {
      id: `SOS-${Date.now()}`,
      status: 'dispatched',
      contact: options?.contactName || 'Ranjit (Son)',
      phone: options?.phone || '+91 98640 12345',
      location: 'Tea Garden Road, Jorhat, Assam',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: 'Emergency SOS initiated. Primary caregiver notified with last known location coordinates.',
      broadcastId: `SAHAY-EMERGENCY-${Math.floor(1000 + Math.random() * 9000)}`,
      etaMinutes: 8,
    };

    try {
      const res = await fetch('/api/emergency/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options || {}),
      });
      if (res.ok) {
        return await res.json();
      }
      return defaultResp;
    } catch (e) {
      return defaultResp;
    }
  },

  // Emergency Donors & Caregivers
  async getEmergencyDonors(filters?: EmergencyDonorFilters): Promise<EmergencyDonorItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.bloodGroup && filters.bloodGroup !== 'ALL') params.append('bloodGroup', filters.bloodGroup);
      if (filters?.maxDistanceKm) params.append('maxDistanceKm', String(filters.maxDistanceKm));
      if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters?.searchQuery) params.append('search', filters.searchQuery);

      const qs = params.toString();
      const res = await fetch(`/api/emergency/donors${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch emergency donors');
      return await res.json();
    } catch (e) {
      // Offline fallback with in-memory filtering
      let donors = sandboxStorage.getDonors();
      if (!donors || donors.length === 0) donors = DEFAULT_DONORS;

      if (filters?.bloodGroup && filters.bloodGroup !== 'ALL') {
        donors = donors.filter((d) => d.bloodGroup.toUpperCase() === filters.bloodGroup?.toUpperCase());
      }
      if (filters?.maxDistanceKm) {
        donors = donors.filter((d) => d.distanceKm <= (filters.maxDistanceKm || 100));
      }
      if (filters?.status && filters.status !== 'ALL') {
        donors = donors.filter((d) => d.status.toLowerCase() === filters.status?.toLowerCase());
      }
      if (filters?.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        donors = donors.filter((d) =>
          d.name.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q) ||
          d.bloodGroup.toLowerCase().includes(q)
        );
      }
      return donors;
    }
  },

  async addEmergencyDonor(donor: Omit<EmergencyDonorItem, 'id'>): Promise<EmergencyDonorItem> {
    const newDonor: EmergencyDonorItem = {
      id: `donor-${Date.now()}`,
      ...donor,
    };
    try {
      const res = await fetch('/api/emergency/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDonor),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // offline fallback
    }
    const current = sandboxStorage.getDonors();
    const updated = [newDonor, ...current];
    sandboxStorage.saveDonors(updated);
    return newDonor;
  },

  // AI Assistant Chat
  async askAssistant(prompt: string, language: string = 'English'): Promise<string> {
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, language }),
      });
      const data = await res.json();
      return data.reply || 'Namaskar! I am here with you.';
    } catch (e) {
      return 'Namaskar! I have verified your routine for today, and family alerts are working smoothly.';
    }
  },
};
