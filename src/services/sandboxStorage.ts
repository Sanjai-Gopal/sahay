/**
 * Sahay — Client Sandbox Storage Adapter
 * 
 * Provides robust, per-visitor local persistence for Demo Sandbox mode.
 * - Allows visitors & contributors to add reminders, new family members, 
 *   or change geofence radius without breaking or spamming a shared live database.
 * - Seeds automatically with pristine Bimala aita defaults.
 * - Can be reset to defaults at any time in Settings.
 */

import { ReminderItem, AppointmentItem, FamilyMemberItem, ZoneEventItem, EmergencyDonorItem } from '../types';

const STORAGE_KEY_PREFIX = 'sahay_sandbox_v1_';

export interface LinkedElder {
  id: string;
  name: string;
  location: string;
  avatarColor: string;
  relationTag: string;
}

export const DEFAULT_ELDERS: LinkedElder[] = [
  { id: 'SHY-9021', name: 'Bimala aita', location: 'Jorhat, Assam', avatarColor: '#22403A', relationTag: 'Mother' },
  { id: 'SHY-4412', name: 'Dimbeswar koka', location: 'Guwahati, Assam', avatarColor: '#BD5B3B', relationTag: 'Father-in-law' },
];

export const DEFAULT_REMINDERS: ReminderItem[] = [
  { id: '1', icon: 'pill', tint: 'ic-clay', txt: 'Morning medicine', time: '8:00 AM', done: true },
  { id: '2', icon: 'droplet', tint: 'ic-indigo', txt: 'Drink warm water', time: '11:00 AM', done: false },
  { id: '3', icon: 'activity', tint: 'ic-forest', txt: 'Evening stroll in garden', time: '5:30 PM', done: false },
  { id: '4', icon: 'calendar', tint: 'ic-marigold', txt: 'Video call with Dr. Baruah', time: '6:15 PM', done: false },
];

export const DEFAULT_APPOINTMENTS: AppointmentItem[] = [
  { id: '1', title: 'Dr. Baruah — Neurology follow-up', date: '12', month: 'SEP', time: '4:00 PM', mode: 'Video call' },
  { id: '2', title: 'Physiotherapy session', date: '18', month: 'SEP', time: '10:30 AM', mode: 'NEIGRIHMS, Shillong' },
  { id: '3', title: 'Routine cognitive assessment', date: '02', month: 'OCT', time: '11:00 AM', mode: 'Community PHC visit' },
];

export const DEFAULT_FAMILY: FamilyMemberItem[] = [
  {
    id: '1',
    name: 'Ranjit',
    rel: 'Son',
    fact: 'Calls every evening at 7. Loves your fish curry.',
    color: '#3E4F74',
    phone: '+91 98640 12345',
    address: 'Boruah Chariali, Jorhat (1.8 km away)',
    voiceNoteText: 'Namaste Aita! I will drop by this evening with fresh pitha.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Priya',
    rel: 'Daughter-in-law',
    fact: 'Visits on Sundays with the grandchildren.',
    color: '#BD5B3B',
    phone: '+91 94350 67890',
    address: 'Tarajan, Jorhat (2.4 km away)',
    voiceNoteText: 'Aita, remember to have warm water after your morning walk!',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Mridul',
    rel: 'Grandson, age 9',
    fact: 'Wants you to teach him the card game again.',
    color: '#22403A',
    phone: '+91 98640 12345',
    address: 'Boruah Chariali, Jorhat',
    voiceNoteText: 'Koka and Aita, I got full marks in drawing today!',
    imageUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    name: 'Deuta (late)',
    rel: 'Husband',
    fact: 'You two planted the tea bushes by the gate together in 1968.',
    color: '#8A5D18',
    address: 'Ancestral Homestead, Jorhat',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
];

export const DEFAULT_ZONE_EVENTS: ZoneEventItem[] = [
  { id: '1', type: 'exit', label: 'Left safe zone', time: '9:14 AM' },
  { id: '2', type: 'enter', label: 'Returned home', time: '9:52 AM' },
  { id: '3', type: 'exit', label: 'Left safe zone', time: 'Yesterday, 6:30 PM' },
  { id: '4', type: 'enter', label: 'Returned home', time: 'Yesterday, 6:48 PM' },
];

export const DEFAULT_DONORS: EmergencyDonorItem[] = [
  {
    id: 'donor-1',
    name: 'Dr. Bhaskar Jyoti Hazarika',
    bloodGroup: 'O+',
    phone: '+91 94350 11223',
    distanceKm: 1.2,
    address: 'Club Road, Jorhat, Assam',
    status: 'available',
    lastDonated: '3 months ago',
    verified: true,
    role: 'Blood Donor',
  },
  {
    id: 'donor-2',
    name: 'Anamika Saikia',
    bloodGroup: 'A+',
    phone: '+91 98640 44556',
    distanceKm: 2.5,
    address: 'Tarajan, Jorhat, Assam',
    status: 'available',
    lastDonated: '1 month ago',
    verified: true,
    role: 'Community Caregiver',
  },
  {
    id: 'donor-3',
    name: 'Debojit Barua',
    bloodGroup: 'B+',
    phone: '+91 97060 77889',
    distanceKm: 3.1,
    address: 'Boruah Chariali, Jorhat, Assam',
    status: 'on-call',
    lastDonated: '4 months ago',
    verified: true,
    role: 'First Responder',
  },
  {
    id: 'donor-4',
    name: 'Jahnavi Das',
    bloodGroup: 'O-',
    phone: '+91 94355 99001',
    distanceKm: 4.8,
    address: 'Gar-Ali, Jorhat, Assam',
    status: 'available',
    lastDonated: '5 months ago',
    verified: true,
    role: 'Blood Donor',
  },
  {
    id: 'donor-5',
    name: 'Bikramjit Sharma',
    bloodGroup: 'AB+',
    phone: '+91 98642 33445',
    distanceKm: 5.4,
    address: 'Kenduguri, Jorhat, Assam',
    status: 'available',
    lastDonated: '2 months ago',
    verified: true,
    role: 'Blood Donor',
  },
  {
    id: 'donor-6',
    name: 'Manash Pratim Gogoi',
    bloodGroup: 'A-',
    phone: '+91 97061 55667',
    distanceKm: 6.2,
    address: 'Cinnamara, Jorhat, Assam',
    status: 'busy',
    lastDonated: '2 weeks ago',
    verified: true,
    role: 'First Responder',
  },
  {
    id: 'donor-7',
    name: 'Kavita Basumatary',
    bloodGroup: 'B-',
    phone: '+91 94351 22334',
    distanceKm: 7.0,
    address: 'Mariani Road, Jorhat, Assam',
    status: 'available',
    lastDonated: '6 months ago',
    verified: true,
    role: 'Community Caregiver',
  },
  {
    id: 'donor-8',
    name: 'Tsering Lhamo',
    bloodGroup: 'AB-',
    phone: '+91 98649 88776',
    distanceKm: 8.5,
    address: 'Jail Road, Jorhat, Assam',
    status: 'on-call',
    lastDonated: '4 months ago',
    verified: true,
    role: 'Blood Donor',
  },
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch {
    // quota or incognito
  }
}

export const sandboxStorage = {
  getReminders(): ReminderItem[] {
    return load<ReminderItem[]>('reminders', DEFAULT_REMINDERS);
  },
  saveReminders(items: ReminderItem[]): void {
    save('reminders', items);
  },

  getAppointments(): AppointmentItem[] {
    return load<AppointmentItem[]>('appointments', DEFAULT_APPOINTMENTS);
  },
  saveAppointments(items: AppointmentItem[]): void {
    save('appointments', items);
  },

  getFamily(): FamilyMemberItem[] {
    return load<FamilyMemberItem[]>('family', DEFAULT_FAMILY);
  },
  saveFamily(items: FamilyMemberItem[]): void {
    save('family', items);
  },

  getSafety(): { radius: number; events: ZoneEventItem[] } {
    return load('safety', { radius: 500, events: DEFAULT_ZONE_EVENTS });
  },
  saveSafety(data: { radius: number; events: ZoneEventItem[] }): void {
    save('safety', data);
  },

  getLinkedElders(): LinkedElder[] {
    return load<LinkedElder[]>('linked_elders', DEFAULT_ELDERS);
  },
  saveLinkedElders(elders: LinkedElder[]): void {
    save('linked_elders', elders);
  },

  getDonors(): EmergencyDonorItem[] {
    return load<EmergencyDonorItem[]>('donors', DEFAULT_DONORS);
  },
  saveDonors(donors: EmergencyDonorItem[]): void {
    save('donors', donors);
  },

  resetAll(): void {
    save('reminders', DEFAULT_REMINDERS);
    save('appointments', DEFAULT_APPOINTMENTS);
    save('family', DEFAULT_FAMILY);
    save('safety', { radius: 500, events: DEFAULT_ZONE_EVENTS });
    save('linked_elders', DEFAULT_ELDERS);
    save('donors', DEFAULT_DONORS);
  },
};
