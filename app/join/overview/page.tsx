'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, saveMeeting, getCurrentCode, getCurrentParticipantId, getWeekdays, AVAILABLE_HOURS, formatHour, findBestSlots, TimeSlot } from '@/lib/store';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function JoinOverview() {
  const router = useRouter();
  const [days, setDays] = useState<string[]>([]);
  const [slotMap, setSlotMap] = useState<Map<string, number>>(new Map());
  const [maxCount, setMaxCount] = useState(1);
  const [totalResponded, setTotalResponded] = useState(0);
  const [topSlots, setTopSlots] = useState<Array<TimeSlot & { count: number }>>([]);

  useEffect(() => {
    const code = getCurrentCode();
    if (!code) { router.replace('/'); return; }
    const meeting = getMeeting(code);
    if (!meeting) { router.replace('/'); return; }

    setDays(getWeekdays(meeting.startDate, meeting.endDate));

    const responded = meeting.participants.filter(p => p.responded);
    setTotalResponded(responded.length);

    const map = new Map<string, number>();
    for (const p of responded) {
      for (const s of p.availableSlots) {
        const key = `${s.date}-${s.hour}`;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    setSlotMap(map);
    setMaxCount(Math.max(...Array.from(map.values()), 1));
    setTopSlots(findBestSlots(meeting.participants));
  }, [router]);

  function handleAutoSelect() {
    const code = getCurrentCode();
    const participantId = getCurrentParticipantId();
    if (!code || !participantId || topSlots.length === 0) return;
    const meeting = getMeeting(code);
    if (!meeting) return;
    if (new Date(meeting.deadline + 'T23:59:59') < new Date()) return;
    if (!meeting) return;
    const top = topSlots[0];
    const updated = {
      ...meeting,
      participants: meeting.participants.map(p =>
        p.id === participantId
          ? { ...p, availableSlots: [{ date: top.date, hour: top.hour }], responded: true }
          : p
      ),
    };
    saveMeeting(updated);
    router.push('/join/status');
  }

  function getCardColor(count: number): string {
    const ratio = count / maxCount;
    if (ratio >= 0.9) return '#3182F6';
    if (ratio >= 0.6) return '#6BAAFF';
    if (ratio >= 0.3) return '#A8CCFF';
    return '#D4E6FF';
  }

  function getTextColor(count: number): string {
    const ratio = count / maxCount;
    return ratio >= 0.6 ? '#ffffff' : '#3182F6';
  }

  const hasAnySlots = slotMap.size > 0;

  return (
    <Shell>
      <div className="flex items-center px-5 pt-5 pb-3">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center -ml-1 text-text-main">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className="px-5 mb-3">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: '50%' }}/>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {!hasAnySlots ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="3" y="5" width="22" height="20" rx="3" stroke="#868E96" strokeWidth="2"/>
                <path d="M3 11h22" stroke="#868E96" strokeWidth="2"/>
                <rect x="9" y="3" width="2" height="4" rx="1" fill="#868E96"/>
                <rect x="17" y="3" width="2" height="4" rx="1" fill="#868E96"/>
              </svg>
            </div>
            <p className="text-[18px] font-bold text-text-main mb-2">아직 선택된 시간이 없어요</p>
            <p className="text-[13px] text-text-sub">첫 번째 선택자가 돼 주세요!</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto px-5">
            <div className="flex gap-2 min-w-max pb-4">
              {days.map(d => {
                const date = new Date(d + 'T00:00:00');
                const daySlots = AVAILABLE_HOURS
                  .map(h => ({ hour: h, count: slotMap.get(`${d}-${h}`) ?? 0 }))
                  .filter(s => s.count > 0);

                return (
                  <div key={d} className="flex flex-col items-center" style={{ width: 88 }}>
                    <p className="text-[11px] text-text-sub mb-0.5">{DAY_NAMES[date.getDay()]}</p>
                    <p className="text-[13px] font-bold text-text-main mb-3">{date.getMonth() + 1}/{date.getDate()}</p>
                    <div className="flex flex-col gap-2 w-full">
                      {daySlots.length === 0 ? (
                        <div className="h-10 rounded-xl bg-surface border border-border"/>
                      ) : (
                        daySlots.map(({ hour, count }) => (
                          <div
                            key={hour}
                            className="rounded-xl px-2 py-2.5 text-center"
                            style={{ backgroundColor: getCardColor(count) }}
                          >
                            <p className="text-[11px] font-semibold leading-none" style={{ color: getTextColor(count) }}>
                              {formatHour(hour)}
                            </p>
                            <p className="text-[10px] mt-0.5 opacity-80" style={{ color: getTextColor(count) }}>
                              {count}명
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="px-5 pb-8 pt-2 space-y-2">
          {hasAnySlots && (
            <button
              onClick={handleAutoSelect}
              className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] active:opacity-90 transition-opacity"
            >
              가장 많은 시간대 자동으로 선택하기
            </button>
          )}
          <button
            onClick={() => router.push('/join/time')}
            className="w-full h-12 border-2 border-border rounded-2xl font-semibold text-[14px] text-text-main active:opacity-80 transition-opacity"
          >
            내 참여시간 직접 입력하기
          </button>
        </div>
      </div>
    </Shell>
  );
}
