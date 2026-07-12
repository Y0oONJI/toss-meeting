export const POSITIONS = ['사원', '주임', '대리', '과장', '차장', '부장', '이사'];
export const AVAILABLE_HOURS = [9, 10, 11, 14, 15, 16, 17];

export interface TimeSlot {
  date: string; // YYYY-MM-DD
  hour: number;
}

export interface Participant {
  id: string;
  name: string;
  position: string;
  role: 'required' | 'optional';
  availableSlots: TimeSlot[];
  responded: boolean;
  adjustmentRequested: boolean;
  suggestedSlots: TimeSlot[];
}

export interface Meeting {
  code: string;
  title: string;
  startDate: string;
  endDate: string;
  deadline: string;
  participants: Participant[];
  status: 'collecting' | 'has_intersection' | 'no_intersection' | 'majority' | 'confirmed';
  confirmedSlot: TimeSlot | null;
  coordinationRound: number;
}

const CURRENT_CODE_KEY = 'current_meeting_code';
const CURRENT_PARTICIPANT_KEY = 'current_participant_id';

export function getMeeting(code: string): Meeting | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(`meeting_${code}`);
  return data ? JSON.parse(data) : null;
}

export function saveMeeting(meeting: Meeting): void {
  localStorage.setItem(`meeting_${meeting.code}`, JSON.stringify(meeting));
}

export function getCurrentCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_CODE_KEY);
}

export function saveCurrentCode(code: string): void {
  localStorage.setItem(CURRENT_CODE_KEY, code);
}

export function getCurrentParticipantId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_PARTICIPANT_KEY);
}

export function saveCurrentParticipantId(id: string): void {
  localStorage.setItem(CURRENT_PARTICIPANT_KEY, id);
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function slotKey(s: TimeSlot) {
  return `${s.date}-${s.hour}`;
}

export function formatSlot(slot: TimeSlot): string {
  const date = new Date(slot.date + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = days[date.getDay()];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const period = slot.hour < 12 ? '오전' : '오후';
  const displayHour = slot.hour <= 12 ? slot.hour : slot.hour - 12;
  return `${month}월 ${day}일 (${dayName}) ${period} ${displayHour}시`;
}

export function formatHour(hour: number): string {
  const period = hour < 12 ? '오전' : '오후';
  const h = hour <= 12 ? hour : hour - 12;
  return `${period} ${h}시`;
}

export function getWeekdays(startDate: string, endDate: string): string[] {
  const days: string[] = [];
  const curr = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (curr <= end && days.length < 7) {
    if (curr.getDay() !== 0 && curr.getDay() !== 6) {
      days.push(curr.toISOString().split('T')[0]);
    }
    curr.setDate(curr.getDate() + 1);
  }
  return days;
}

export function getNextMonday(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  return next.toISOString().split('T')[0];
}

export function findIntersection(participants: Participant[]): TimeSlot[] {
  const required = participants.filter(p => p.role === 'required' && p.responded);
  if (required.length === 0) return [];
  return required[0].availableSlots.filter(slot => {
    const key = slotKey(slot);
    return required.every(p => p.availableSlots.some(s => slotKey(s) === key));
  });
}

export function findBestSlots(participants: Participant[]): Array<TimeSlot & { count: number }> {
  const responded = participants.filter(p => p.responded);
  const counts = new Map<string, { slot: TimeSlot; count: number }>();
  for (const p of responded) {
    for (const slot of p.availableSlots) {
      const key = slotKey(slot);
      const ex = counts.get(key);
      if (ex) ex.count++;
      else counts.set(key, { slot, count: 1 });
    }
  }
  return Array.from(counts.values())
    .map(({ slot, count }) => ({ ...slot, count }))
    .sort((a, b) => b.count - a.count || a.date.localeCompare(b.date) || a.hour - b.hour)
    .slice(0, 3);
}

export function createDemoParticipants(startDate: string): Participant[] {
  const end = new Date(startDate + 'T00:00:00');
  end.setDate(end.getDate() + 6);
  const days = getWeekdays(startDate, end.toISOString().split('T')[0]);
  const d = (i: number) => days[Math.min(i, days.length - 1)];

  return [
    {
      id: 'demo-1', name: '김민준', position: '대리', role: 'required',
      availableSlots: [
        { date: d(0), hour: 10 }, { date: d(1), hour: 10 },
        { date: d(1), hour: 14 }, { date: d(2), hour: 10 },
      ],
      responded: true, adjustmentRequested: false, suggestedSlots: [],
    },
    {
      id: 'demo-2', name: '이서연', position: '과장', role: 'required',
      availableSlots: [
        { date: d(1), hour: 10 }, { date: d(2), hour: 10 },
        { date: d(2), hour: 14 }, { date: d(3), hour: 14 },
      ],
      responded: true, adjustmentRequested: false, suggestedSlots: [],
    },
    {
      id: 'demo-3', name: '박지훈', position: '사원', role: 'optional',
      availableSlots: [
        { date: d(0), hour: 10 }, { date: d(1), hour: 10 },
        { date: d(3), hour: 10 }, { date: d(3), hour: 14 },
      ],
      responded: true, adjustmentRequested: false, suggestedSlots: [],
    },
    {
      id: 'demo-4', name: '최아영', position: '주임', role: 'required',
      availableSlots: [
        { date: d(1), hour: 10 }, { date: d(1), hour: 14 },
        { date: d(2), hour: 10 }, { date: d(4), hour: 14 },
      ],
      responded: true, adjustmentRequested: false, suggestedSlots: [],
    },
    {
      id: 'demo-5', name: '정현우', position: '대리', role: 'optional',
      availableSlots: [],
      responded: false, adjustmentRequested: false, suggestedSlots: [],
    },
  ];
}
