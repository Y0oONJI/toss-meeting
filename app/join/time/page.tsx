'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, saveMeeting, getCurrentCode, getCurrentParticipantId, getWeekdays, AVAILABLE_HOURS, formatHour, TimeSlot } from '@/lib/store';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function JoinTime() {
  const router = useRouter();
  const [days, setDays] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const code = getCurrentCode();
    if (!code) { router.replace('/'); return; }
    const meeting = getMeeting(code);
    if (!meeting) { router.replace('/'); return; }
    setDays(getWeekdays(meeting.startDate, meeting.endDate));
    if (new Date(meeting.deadline + 'T23:59:59') < new Date()) {
      setIsExpired(true);
    }
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
      const parts = key.split('-');
      const hour = parseInt(parts[parts.length - 1]);
      const date = parts.slice(0, parts.length - 1).join('-');
      availableSlots.push({ date, hour });
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

  if (days.length === 0 && !isExpired) return null;

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

        {isExpired ? (
          <div className="rounded-2xl bg-surface border-2 border-border p-8 text-center">
            <p className="text-[17px] font-bold text-text-main mb-2">마감 시간이 지났어요</p>
            <p className="text-[13px] text-text-sub">응답 마감일이 지나 입력할 수 없어요</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          onClick={handleSubmit}
          disabled={selected.size === 0 || isExpired}
          className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:opacity-90 transition-opacity"
        >
          {isExpired ? '마감 시간이 지났어요' : '제출하기'}
        </button>
      </div>
    </Shell>
  );
}
