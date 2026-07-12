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
  headcount: number;
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

export function clearSessionState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_CODE_KEY);
  localStorage.removeItem(CURRENT_PARTICIPANT_KEY);
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

const DEMO_POOL: Array<{ name: string; position: string; role: 'required' | 'optional' }> = [
  { name: '김민준', position: '대리', role: 'required' },
  { name: '이서연', position: '과장', role: 'required' },
  { name: '박지훈', position: '사원', role: 'optional' },
  { name: '최아영', position: '주임', role: 'required' },
  { name: '정현우', position: '대리', role: 'optional' },
  { name: '한지수', position: '차장', role: 'required' },
  { name: '오민석', position: '사원', role: 'optional' },
  { name: '윤채원', position: '주임', role: 'required' },
  { name: '임태양', position: '대리', role: 'optional' },
  { name: '강하늘', position: '과장', role: 'required' },
  { name: '신지영', position: '사원', role: 'optional' },
  { name: '류성민', position: '주임', role: 'required' },
  { name: '권나은', position: '차장', role: 'optional' },
  { name: '배준서', position: '대리', role: 'required' },
  { name: '조아라', position: '사원', role: 'optional' },
  { name: '문현진', position: '과장', role: 'required' },
  { name: '노지현', position: '주임', role: 'optional' },
  { name: '황도연', position: '대리', role: 'required' },
  { name: '서민아', position: '사원', role: 'optional' },
];

const SLOT_PATTERNS = [
  [{ di: 0, h: 10 }, { di: 1, h: 10 }, { di: 1, h: 14 }, { di: 2, h: 10 }],
  [{ di: 1, h: 10 }, { di: 2, h: 10 }, { di: 2, h: 14 }, { di: 3, h: 14 }],
  [{ di: 0, h: 10 }, { di: 1, h: 10 }, { di: 3, h: 10 }, { di: 3, h: 14 }],
  [{ di: 1, h: 10 }, { di: 1, h: 14 }, { di: 2, h: 10 }, { di: 4, h: 14 }],
  [{ di: 0, h: 14 }, { di: 1, h: 10 }, { di: 2, h: 16 }, { di: 4, h: 10 }],
  [{ di: 1, h: 10 }, { di: 3, h: 10 }, { di: 3, h: 14 }, { di: 4, h: 14 }],
  [{ di: 0, h: 10 }, { di: 2, h: 10 }, { di: 2, h: 14 }, { di: 3, h: 10 }],
];

export const DEMO_CODE = 'DEMO01';
export const DEMO02_CODE = 'DEMO02';

export function seedDemoMeeting(): void {
  if (typeof window === 'undefined') return;
  const startDate = getNextMonday();
  const endDate = (() => {
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  })();
  const deadline = endDate; // 데모: 회의 기간 마지막 날까지 응답 가능

  // 항상 덮어씀 — 심사자가 홈으로 돌아올 때마다 초기 상태로 리셋

  const meeting: Meeting = {
    code: DEMO_CODE,
    title: 'Q3 전략 회의',
    headcount: 6,
    startDate,
    endDate,
    deadline,
    participants: createDemoParticipants(startDate, 6),
    status: 'collecting',
    confirmedSlot: null,
    coordinationRound: 0,
  };
  saveMeeting(meeting);
}

export function seedDemo2Meeting(): void {
  if (typeof window === 'undefined') return;
  const startDate = getNextMonday();
  const endDate = (() => {
    const d = new Date(startDate + 'T00:00:00');
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  })();
  const deadline = endDate;

  // 항상 덮어씀 — 심사자가 홈으로 돌아올 때마다 초기 상태로 리셋

  const days = getWeekdays(startDate, endDate);
  const d = (i: number) => days[Math.min(i, days.length - 1)];

  // Required participants have NO common slots — each covers a different day
  const participants: Participant[] = [
    {
      id: 'demo2-1', name: '김태양', position: '대리', role: 'required',
      availableSlots: [{ date: d(0), hour: 9 }, { date: d(0), hour: 10 }, { date: d(0), hour: 11 }],
      responded: true, adjustmentRequested: false, suggestedSlots: [],
    },
    {
      id: 'demo2-2', name: '박나은', position: '과장', role: 'required',
      availableSlots: [{ date: d(1), hour: 14 }, { date: d(1), hour: 15 }, { date: d(1), hour: 16 }],
      responded: true, adjustmentRequested: false, suggestedSlots: [],
    },
    {
      id: 'demo2-3', name: '이현서', position: '주임', role: 'required',
      availableSlots: [{ date: d(2), hour: 9 }, { date: d(2), hour: 10 }, { date: d(2), hour: 11 }],
      responded: true, adjustmentRequested: false, suggestedSlots: [],
    },
    {
      id: 'demo2-4', name: '최민준', position: '사원', role: 'required',
      availableSlots: [{ date: d(3), hour: 14 }, { date: d(3), hour: 15 }, { date: d(3), hour: 16 }],
      responded: true, adjustmentRequested: false, suggestedSlots: [],
    },
    {
      id: 'demo2-5', name: '정수연', position: '차장', role: 'optional',
      availableSlots: [{ date: d(0), hour: 10 }, { date: d(1), hour: 15 }, { date: d(2), hour: 10 }],
      responded: true, adjustmentRequested: false, suggestedSlots: [],
    },
    {
      id: 'demo2-6', name: '한지수', position: '대리', role: 'optional',
      availableSlots: [], responded: false, adjustmentRequested: false, suggestedSlots: [],
    },
  ];

  const meeting: Meeting = {
    code: DEMO02_CODE,
    title: '신규 서비스 기획 회의',
    headcount: 6,
    startDate,
    endDate,
    deadline,
    participants,
    status: 'collecting',
    confirmedSlot: null,
    coordinationRound: 0,
  };
  saveMeeting(meeting);
}

export function createDemoParticipants(startDate: string, count: number = 6): Participant[] {
  const end = new Date(startDate + 'T00:00:00');
  end.setDate(end.getDate() + 6);
  const days = getWeekdays(startDate, end.toISOString().split('T')[0]);
  const d = (i: number) => days[Math.min(i, days.length - 1)];

  const demoCount = Math.max(1, count - 1); // coordinator is 1
  return Array.from({ length: demoCount }, (_, i) => {
    const info = DEMO_POOL[i % DEMO_POOL.length];
    const isLast = i === demoCount - 1;
    const pattern = SLOT_PATTERNS[i % SLOT_PATTERNS.length];
    return {
      id: `demo-${i + 1}`,
      name: info.name,
      position: info.position,
      role: info.role,
      availableSlots: isLast ? [] : pattern.map(({ di, h }) => ({ date: d(di), hour: h })),
      responded: !isLast,
      adjustmentRequested: false,
      suggestedSlots: [],
    };
  });
}
