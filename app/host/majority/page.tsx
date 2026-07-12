'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, getCurrentCode, saveMeeting, findBestSlots, Meeting, formatSlot, TimeSlot } from '@/lib/store';

export default function HostMajority() {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [selected, setSelected] = useState<TimeSlot | null>(null);

  useEffect(() => {
    const code = getCurrentCode();
    if (!code) { router.replace('/'); return; }
    const m = getMeeting(code);
    if (!m) { router.replace('/'); return; }
    setMeeting(m);
  }, [router]);

  if (!meeting) return null;

  const bestSlots = findBestSlots(meeting.participants);
  const totalResponded = meeting.participants.filter(p => p.responded).length;
  const topSlot = selected ?? bestSlots[0] ?? null;

  function handleConfirm() {
    if (!topSlot || !meeting) return;
    const updated = { ...meeting, status: 'confirmed' as const, confirmedSlot: topSlot };
    saveMeeting(updated);
    router.push('/host/confirmed');
  }

  return (
    <Shell>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center -ml-1 text-text-main">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span className="text-[13px] font-medium text-text-sub">{meeting.title}</span>
        <div className="w-9"/>
      </div>

      <div className="flex-1 px-5 pb-4 overflow-y-auto">
        <div className="bg-[#FFF8F5] border border-[#FFD6C0] rounded-2xl p-3 mb-5">
          <p className="text-[12px] font-semibold text-warn">2회 조율 후 다수결로 결정해요</p>
          <p className="text-[12px] text-text-sub mt-0.5">가장 많은 사람이 가능한 시간 순으로 정렬됐어요</p>
        </div>

        <h1 className="text-[22px] font-bold text-text-main mb-1">다수결 결과</h1>
        <p className="text-sm text-text-sub mb-6">원하는 시간을 선택해 확정해주세요</p>

        <div className="space-y-3">
          {bestSlots.map((slot, i) => {
            const key = `${slot.date}-${slot.hour}`;
            const isSelected = topSlot && `${topSlot.date}-${topSlot.hour}` === key;
            const pct = Math.round((slot.count / totalResponded) * 100);
            return (
              <button
                key={i}
                onClick={() => setSelected(slot)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected ? 'border-primary bg-primary-light' : 'border-border bg-surface'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[15px] font-semibold ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                    {formatSlot(slot)}
                  </span>
                  <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-primary text-white' : 'bg-border text-text-sub'
                  }`}>
                    {slot.count}/{totalResponded}명
                  </span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isSelected ? 'bg-primary' : 'bg-text-sub'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          onClick={handleConfirm}
          disabled={!topSlot}
          className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:opacity-90 transition-opacity"
        >
          이 시간으로 확정하기
        </button>
      </div>
    </Shell>
  );
}
