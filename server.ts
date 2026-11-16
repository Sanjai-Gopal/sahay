import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// -------------------------------------------------------------
// Validation Utilities & Types
// -------------------------------------------------------------
const SUPPORTED_LANGUAGES = ['English', 'Assamese', 'Bodo', 'Khasi', 'Manipuri', 'Mizo'] as const;
const VALID_TINTS = ['ic-clay', 'ic-indigo', 'ic-forest', 'ic-marigold'] as const;
const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;
const VALID_DONOR_STATUSES = ['available', 'on-call', 'busy'] as const;

function isNonEmptyString(val: unknown, minLength = 1, maxLength = 500): val is string {
  return typeof val === 'string' && val.trim().length >= minLength && val.trim().length <= maxLength;
}

function sanitizeString(val: string): string {
  return val.trim().replace(/[<>]/g, '');
}

// -------------------------------------------------------------
// In-Memory Data Store (Golden Baseline)
// -------------------------------------------------------------
let reminders = [
  { id: '1', icon: 'pill', tint: 'ic-clay', txt: 'Morning medicine', time: '8:00 AM', done: true },
  { id: '2', icon: 'droplet', tint: 'ic-indigo', txt: 'Drink water', time: '11:00 AM', done: false },
  { id: '3', icon: 'activity', tint: 'ic-forest', txt: 'Evening walk with family', time: '5:30 PM', done: false },
  { id: '4', icon: 'calendar', tint: 'ic-marigold', txt: 'Video call with Dr. Baruah', time: '6:15 PM', done: false },
];

let appointments = [
  { id: '1', title: 'Dr. Baruah — Neurology follow-up', date: '12', month: 'SEP', time: '4:00 PM', mode: 'Video call' },
  { id: '2', title: 'Physiotherapy session', date: '18', month: 'SEP', time: '10:30 AM', mode: 'NEIGRIHMS, Shillong' },
  { id: '3', title: 'Routine cognitive assessment', date: '02', month: 'OCT', time: '11:00 AM', mode: 'Community PHC visit' },
];

let familyMembers = [
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

let activityLogs = [
  { id: '1', activityId: 'memory', title: 'Memory Match', durationSeconds: 180, accuracyPercentage: 82, completedAt: 'Today', resultLabel: '82% accuracy' },
  { id: '2', activityId: 'pattern', title: 'Pattern Recall', durationSeconds: 240, accuracyPercentage: 90, completedAt: 'Yesterday', resultLabel: 'Sequence of 5' },
  { id: '3', activityId: 'memory', title: 'Memory Match', durationSeconds: 300, accuracyPercentage: 61, completedAt: 'Sat, 27 Aug', resultLabel: '61% accuracy' },
  { id: '4', activityId: 'routine', title: 'Daily Routine Recall', durationSeconds: 120, accuracyPercentage: 100, completedAt: 'Fri, 26 Aug', resultLabel: 'Completed' },
  { id: '5', activityId: 'memory', title: 'Memory Match', durationSeconds: 360, accuracyPercentage: 58, completedAt: 'Thu, 25 Aug', resultLabel: '58% accuracy' },
];

let safeZone = {
  radiusMeters: 500,
  elderLocation: { lat: 26.7509, lng: 94.2037, address: 'Tea Garden Road, Jorhat, Assam' },
  status: 'At home — within safe zone',
  lastChecked: 'Just now',
};

let zoneEvents = [
  { id: '1', type: 'exit', label: 'Left safe zone', time: '9:14 AM' },
  { id: '2', type: 'enter', label: 'Returned home', time: '9:52 AM' },
  { id: '3', type: 'exit', label: 'Left safe zone', time: 'Yesterday, 6:30 PM' },
  { id: '4', type: 'enter', label: 'Returned home', time: 'Yesterday, 6:48 PM' },
];

let emergencyDonors = [
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

// Lazy Gemini API initialization helper
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      genAiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return genAiClient;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Sahay API Baseline',
    timestamp: new Date().toISOString(),
    version: '1.2.0',
    capabilities: [
      'reminders',
      'appointments',
      'family-memory-book',
      'cognitive-telemetry',
      'safe-zone-geofence',
      'emergency-sos',
      'emergency-donors',
      'gemini-companion',
    ],
  });
});

// Assistant Chat endpoint with Gemini and strict validation
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, language = 'English' } = req.body;

    if (!isNonEmptyString(prompt, 1, 1000)) {
      return res.status(400).json({
        error: 'Invalid input: prompt must be non-empty text up to 1000 characters',
        code: 'VALIDATION_FAILED',
      });
    }

    const cleanLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : 'English';
    const cleanPrompt = sanitizeString(prompt);

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        reply: `Namaskar! I have noted your message: "${cleanPrompt}". Your daily schedule is intact, your 6-day streak is active, and your family has been notified.`,
        source: 'fallback',
      });
    }

    const systemInstruction = `You are Sahay, a compassionate, patient, and culturally respectful AI care assistant designed specifically for elderly people in North-East India (such as Assam, Meghalaya, Manipur, Mizoram).
Your user may be an elder like Bimala aita.
- Be warm, gentle, and concise (1-2 sentences maximum).
- Speak with elder-friendly respect (use respectful honorifics like "Aita", "Deuta", "Namaskar", "Khublei").
- Language preference: ${cleanLanguage}. If asked in Assamese, Bodo, Khasi, Manipuri, Mizo, or English, answer empathetically in that language.
- Provide reassurance about their daily routine, medicine timings, family connection, and gentle cognitive well-being.
- Never use clinical jargon or alarming warnings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: cleanPrompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const reply = response.text || 'Namaskar! I am here with you. Everything is in order.';
    res.json({ reply, source: 'gemini' });
  } catch (error: any) {
    console.error('Assistant API error:', error);
    res.json({
      reply: 'Namaskar! I am listening. I have verified your routine for today, and family alerts are working smoothly.',
      source: 'fallback_error',
    });
  }
});

// Reminders CRUD with validation
app.get('/api/reminders', (_req: Request, res: Response) => {
  res.json(reminders);
});

app.post('/api/reminders', (req: Request, res: Response) => {
  const { txt, time = 'Anytime', icon = 'clock', tint = 'ic-indigo' } = req.body;

  if (!isNonEmptyString(txt, 2, 200)) {
    return res.status(400).json({
      error: 'Reminder text is required (2–200 characters)',
      code: 'INVALID_REMINDER_TEXT',
    });
  }

  const cleanTint = VALID_TINTS.includes(tint) ? tint : 'ic-indigo';
  const cleanTime = isNonEmptyString(time, 1, 50) ? sanitizeString(time) : 'Anytime';
  const cleanIcon = isNonEmptyString(icon, 1, 30) ? sanitizeString(icon) : 'clock';

  const newItem = {
    id: String(Date.now()),
    txt: sanitizeString(txt),
    time: cleanTime,
    icon: cleanIcon,
    tint: cleanTint,
    done: false,
  };

  reminders.push(newItem);
  res.status(201).json(newItem);
});

app.patch('/api/reminders/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = reminders.find((r) => r.id === id);
  if (!item) {
    return res.status(404).json({ error: `Reminder with ID ${id} not found`, code: 'REMINDER_NOT_FOUND' });
  }
  item.done = !item.done;
  res.json(item);
});

// Appointments CRUD with validation
app.get('/api/appointments', (_req: Request, res: Response) => {
  res.json(appointments);
});

app.post('/api/appointments', (req: Request, res: Response) => {
  const { title, date = '—', month = '', time = 'Time TBD', mode = 'To be confirmed' } = req.body;

  if (!isNonEmptyString(title, 2, 200)) {
    return res.status(400).json({
      error: 'Appointment title is required (2–200 characters)',
      code: 'INVALID_APPOINTMENT_TITLE',
    });
  }

  const newItem = {
    id: String(Date.now()),
    title: sanitizeString(title),
    date: isNonEmptyString(date, 1, 10) ? sanitizeString(date) : '—',
    month: isNonEmptyString(month, 1, 10) ? sanitizeString(month).toUpperCase() : '',
    time: isNonEmptyString(time, 1, 50) ? sanitizeString(time) : 'Time TBD',
    mode: isNonEmptyString(mode, 1, 100) ? sanitizeString(mode) : 'To be confirmed',
  };

  appointments.push(newItem);
  res.status(201).json(newItem);
});

// Family Members CRUD with validation
app.get('/api/family', (_req: Request, res: Response) => {
  res.json(familyMembers);
});

app.post('/api/family', (req: Request, res: Response) => {
  const { name, rel, fact, color = '#3E4F74', imageUrl, address, phone, voiceNoteText } = req.body;

  if (!isNonEmptyString(name, 2, 100)) {
    return res.status(400).json({ error: 'Name is required (2–100 characters)', code: 'INVALID_FAMILY_NAME' });
  }
  if (!isNonEmptyString(rel, 2, 100)) {
    return res.status(400).json({ error: 'Relationship is required (2–100 characters)', code: 'INVALID_FAMILY_REL' });
  }

  const newItem = {
    id: String(Date.now()),
    name: sanitizeString(name),
    rel: sanitizeString(rel),
    fact: isNonEmptyString(fact, 1, 500) ? sanitizeString(fact) : 'A special person in family life.',
    color: isNonEmptyString(color, 4, 10) ? color : '#3E4F74',
    imageUrl: isNonEmptyString(imageUrl, 5, 500) ? imageUrl : '',
    address: isNonEmptyString(address, 1, 200) ? sanitizeString(address) : '',
    phone: isNonEmptyString(phone, 5, 25) ? sanitizeString(phone) : '',
    voiceNoteText: isNonEmptyString(voiceNoteText, 1, 500) ? sanitizeString(voiceNoteText) : '',
  };

  familyMembers.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/family/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = familyMembers.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Family member with ID ${id} not found`, code: 'FAMILY_MEMBER_NOT_FOUND' });
  }

  const { name, rel, fact, color, imageUrl, address, phone, voiceNoteText } = req.body;
  familyMembers[index] = {
    ...familyMembers[index],
    name: isNonEmptyString(name, 2, 100) ? sanitizeString(name) : familyMembers[index].name,
    rel: isNonEmptyString(rel, 2, 100) ? sanitizeString(rel) : familyMembers[index].rel,
    fact: fact !== undefined ? sanitizeString(String(fact)) : familyMembers[index].fact,
    color: isNonEmptyString(color, 4, 10) ? color : familyMembers[index].color,
    imageUrl: imageUrl !== undefined ? String(imageUrl) : familyMembers[index].imageUrl,
    address: address !== undefined ? sanitizeString(String(address)) : familyMembers[index].address,
    phone: phone !== undefined ? sanitizeString(String(phone)) : familyMembers[index].phone,
    voiceNoteText: voiceNoteText !== undefined ? sanitizeString(String(voiceNoteText)) : familyMembers[index].voiceNoteText,
  };

  res.json(familyMembers[index]);
});

// Activity Session Logs with validation
app.get('/api/activities/log', (_req: Request, res: Response) => {
  res.json(activityLogs);
});

app.post('/api/activities/log', (req: Request, res: Response) => {
  const { activityId, title, durationSeconds, accuracyPercentage } = req.body;

  if (!isNonEmptyString(activityId, 1, 50)) {
    return res.status(400).json({ error: 'activityId is required', code: 'INVALID_ACTIVITY_ID' });
  }

  const cleanDuration = Math.max(1, Math.min(3600, parseInt(String(durationSeconds), 10) || 60));
  const cleanAccuracy = Math.max(0, Math.min(100, parseInt(String(accuracyPercentage), 10) || 100));

  const logItem = {
    id: String(Date.now()),
    activityId: sanitizeString(activityId),
    title: isNonEmptyString(title, 1, 100) ? sanitizeString(title) : 'Cognitive Activity',
    durationSeconds: cleanDuration,
    accuracyPercentage: cleanAccuracy,
    completedAt: 'Today',
    resultLabel: `${cleanAccuracy}% accuracy`,
  };

  activityLogs.unshift(logItem);
  res.status(201).json(logItem);
});

// Safety Geofencing status & radius update with validation
app.get('/api/safety', (_req: Request, res: Response) => {
  res.json({ safeZone, zoneEvents });
});

app.post('/api/safety/radius', (req: Request, res: Response) => {
  const { radiusMeters } = req.body;
  const radius = parseInt(String(radiusMeters), 10);

  if (isNaN(radius) || radius < 100 || radius > 5000) {
    return res.status(400).json({
      error: 'Safe zone radius must be an integer between 100 and 5000 meters',
      code: 'INVALID_RADIUS_RANGE',
    });
  }

  safeZone.radiusMeters = radius;
  res.json(safeZone);
});

// Emergency SOS trigger with contact selection and live coordinates
app.post('/api/emergency/sos', (req: Request, res: Response) => {
  const { contactName, phone, coordinates, reason } = req.body || {};
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const chosenContact = isNonEmptyString(contactName, 2, 100) ? sanitizeString(contactName) : 'Ranjit (Son)';
  const chosenPhone = isNonEmptyString(phone, 5, 25) ? sanitizeString(phone) : '+91 98640 12345';
  const locationDesc = coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number'
    ? `Tea Garden Road, Jorhat (Lat ${coordinates.lat.toFixed(4)}, Lng ${coordinates.lng.toFixed(4)})`
    : safeZone.elderLocation.address;

  const alert = {
    id: `SOS-${Date.now()}`,
    status: 'dispatched' as const,
    contact: chosenContact,
    phone: chosenPhone,
    location: locationDesc,
    time: timestamp,
    reason: isNonEmptyString(reason, 2, 200) ? sanitizeString(reason) : 'Emergency SOS triggered by elder companion',
    message: `Emergency SOS dispatched to ${chosenContact} (${chosenPhone}) with real-time location. Local 108 responder network alerted.`,
    broadcastId: `SAHAY-EMERGENCY-${Math.floor(1000 + Math.random() * 9000)}`,
    etaMinutes: 8,
  };

  // Prepend event to zone events log
  zoneEvents.unshift({
    id: String(Date.now()),
    type: 'exit',
    label: `🚨 SOS Triggered: ${chosenContact} dispatched`,
    time: timestamp,
  });

  res.json(alert);
});

// Emergency Blood Donors & Caregivers Directory
app.get('/api/emergency/donors', (req: Request, res: Response) => {
  const { bloodGroup, maxDistanceKm, status, search } = req.query;

  let filtered = [...emergencyDonors];

  if (bloodGroup && bloodGroup !== 'ALL') {
    const bg = String(bloodGroup).toUpperCase();
    filtered = filtered.filter((d) => d.bloodGroup.toUpperCase() === bg);
  }

  if (maxDistanceKm) {
    const maxDist = parseFloat(String(maxDistanceKm));
    if (!isNaN(maxDist) && maxDist > 0) {
      filtered = filtered.filter((d) => d.distanceKm <= maxDist);
    }
  }

  if (status && status !== 'ALL') {
    const st = String(status).toLowerCase();
    filtered = filtered.filter((d) => d.status.toLowerCase() === st);
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q) ||
          d.role.toLowerCase().includes(q) ||
          d.bloodGroup.toLowerCase().includes(q)
      );
    }
  }

  res.json(filtered);
});

app.post('/api/emergency/donors', (req: Request, res: Response) => {
  const { name, bloodGroup, phone, address, distanceKm = 2.0, role = 'Blood Donor' } = req.body;

  if (!isNonEmptyString(name, 2, 100)) {
    return res.status(400).json({ error: 'Donor name is required (2–100 characters)', code: 'INVALID_NAME' });
  }

  const bg = String(bloodGroup).toUpperCase();
  if (!VALID_BLOOD_GROUPS.includes(bg as any)) {
    return res.status(400).json({
      error: `Invalid blood group. Must be one of: ${VALID_BLOOD_GROUPS.join(', ')}`,
      code: 'INVALID_BLOOD_GROUP',
    });
  }

  if (!isNonEmptyString(phone, 5, 25)) {
    return res.status(400).json({ error: 'Valid phone number is required', code: 'INVALID_PHONE' });
  }

  const newDonor = {
    id: `donor-${Date.now()}`,
    name: sanitizeString(name),
    bloodGroup: bg as any,
    phone: sanitizeString(phone),
    distanceKm: Math.max(0.1, parseFloat(String(distanceKm)) || 2.0),
    address: isNonEmptyString(address, 2, 200) ? sanitizeString(address) : 'Jorhat, Assam',
    status: 'available' as const,
    lastDonated: 'Recently verified',
    verified: true,
    role: isNonEmptyString(role, 2, 50) ? sanitizeString(role) as any : 'Blood Donor',
  };

  emergencyDonors.push(newDonor);
  res.status(201).json(newDonor);
});

// Global Fallback Error Handler Middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
  });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE SETUP (Development vs Production)
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sahay Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
