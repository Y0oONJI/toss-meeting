'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, saveMeeting, getCurrentCode, getCurrentParticipantId, getWeekdays, AVAILABLE_HOURS, formatHour, TimeSlot, slotKey } from '@/lib/store';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function JoinTime() {
  const router = useRouter();
  const [days, setDays] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [meetingTitle, setMeetingTitle] = useState('');

  useEffect(() => {
    const code = getCurrentCode();
    if (!code) { router.replace('/'); return; }
    const meeting = getMeeting(code);
    if (!meeting) { router.replace('/'); return; }
    setMeetingTitle(meeting.title);
    setDays(getWeekdays(meeting.startDate, meeting.endDate));
  }, [router]);

  function toggle(date: string, hour: number) {
    const key = `${date}-${hour}`;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSubmit() {
    const code = getCurrentCode();
    const participantId = getCurrentParticipantId();
    if (!code || !participantId) { router.replace('/'); return; }
    const meeting = getMeeting(code);
    if (!meeting) { router.replace('/'); return; }

    const availableSlots: TimeSlot[] = [];
    for (const key of selected) {
      const [date, hourStr] = key.split('-').reduce<[string, string]>((acc, part, i, arr) => {
        if (i < arr.length - 1) acc[0] = acc[0] ? acc[0] + '-' + part : part;
        else acc[1] = part;
        return acc;
      }, ['', '']);
      availableSlots.push({ date, hour: parseInt(hourStr) });
    }

    const updated = {
      ...meeting,
      participants: meeting.participants.map(p =>
        p.id === participantId
          ? { ...p, availableSlots, responded: true }
          : p
      ),
    };
    saveMeeting(updated);
    router.push('/join/status');
  }

  if (days.length === 0) return null;

  return (
    <Shell>
      <div className="flex items-center px-5 pt-5 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center -ml-1 text-text-main">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className="px-5 mb-4">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: '66%' }}/>
        </div>
      </div>

      <div className="flex-1 px-5 pb-4 overflow-y-auto">
        <h1 className="text-[22px] font-bold text-text-main mb-1">언제 가능하세요?</h1>
        <p className="text-sm text-text-sub mb-5">가능한 시간대를 모두 선택해주세요</p>

        <div className="overflow-x-auto">
          <div className="min-w-0">
            <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}>
              <div/>
              {days.map(d => {
                const date = new Date(d + 'T00:00:00');
                return (
                  <div key={d} className="text-center">
                    <span className="block text-[10px] text-text-sub">{DAY_NAMES[date.getDay()]}</span>
                    <span className="block text-[12px] font-bold text-text-main">{date.getDate()}</span>
                  </div>
                );
              })}
            </div>

            {AVAILABLE_HOURS.map(hour => (
              <div key={hour} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}>
                <div className="flex items-center">
                  <span className="text-[10px] text-text-sub whitespace-nowrap">{formatHour(hour)}</span>
                </div>
                {days.map(d => {
                  const key = `${d}-${hour}`;
                  const isOn = selected.has(key);
                  return (
                    <button
                      key={d}
                      onClick={() => toggle(d, hour)}
                      className={`h-9 rounded-lg border-2 transition-all ${
                        isOn
                          ? 'bg-primary border-primary'
                          : 'bg-surface border-border'
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {selected.size > 0 && (
          <p className="text-[12px] text-primary font-medium text-center mt-3">
            {selected.size}개 시간대 선택됨
          </p>
        )}
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          onClick={handleSubmit}
          disabled={selected.size === 0}
          className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:opacity-90 transition-opacity"
        >
          제출하기
        </button>
      </div>
    </Shell>
  );
}
