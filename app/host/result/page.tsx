'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, getCurrentCode, saveMeeting, findIntersection, findBestSlots, Meeting, TimeSlot, formatSlot } from '@/lib/store';

export default function HostResult() {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [intersection, setIntersection] = useState<TimeSlot[]>([]);
  const [bestSlot, setBestSlot] = useState<(TimeSlot & { count: number }) | null>(null);
  const [selected, setSelected] = useState<TimeSlot | null>(null);

  useEffect(() => {
    const code = getCurrentCode();
    if (!code) { router.replace('/'); return; }
    const m = getMeeting(code);
    if (!m) { router.replace('/'); return; }
    setMeeting(m);
    const inter = findIntersection(m.participants);
    setIntersection(inter);
    if (inter.length > 0) {
      setSelected(inter[0]);
    } else {
      const best = findBestSlots(m.participants);
      setBestSlot(best[0] ?? null);
      if (best[0]) setSelected(best[0]);
    }
  }, [router]);

  if (!meeting) return null;

  function handleConfirm() {
    if (!selected || !meeting) return;
    const updated = { ...meeting, status: 'confirmed' as const, confirmedSlot: selected };
    saveMeeting(updated);
    router.push('/host/confirmed');
  }

  const totalResponded = meeting.participants.filter(p => p.responded).length;

  function slotParticipantCount(slot: TimeSlot) {
    const key = `${slot.date}-${slot.hour}`;
    return meeting!.participants.filter(p =>
      p.responded && p.availableSlots.some(s => `${s.date}-${s.hour}` === key)
    ).length;
  }

  const hasIntersection = intersection.length > 0;

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
        {hasIntersection ? (
          <>
            <h1 className="text-[22px] font-bold text-text-main mb-1">모두 가능한 시간이에요</h1>
            <p className="text-sm text-text-sub mb-6">하나를 선택해서 확정해주세요</p>

            <div className="space-y-3">
              {intersection.map((slot, i) => {
                const count = slotParticipantCount(slot);
                const key = `${slot.date}-${slot.hour}`;
                const isSelected = selected && `${selected.date}-${selected.hour}` === key;
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(slot)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected ? 'border-primary bg-primary-light' : 'border-border bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[15px] font-semibold ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                        {formatSlot(slot)}
                      </span>
                      <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-primary text-white' : 'bg-border text-text-sub'
                      }`}>
                        {count}/{totalResponded}명
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-[22px] font-bold text-text-main mb-1">모두가 가능한 시간은 없어요</h1>
            <p className="text-sm text-text-sub mb-6">가장 많은 사람이 선택한 시간으로 확정할 수 있어요</p>

            {bestSlot && (
              <div className="bg-surface rounded-2xl p-5 mb-4">
                <p className="text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-2">최다 선택 시간</p>
                <p className="text-[20px] font-bold text-text-main mb-1">{formatSlot(bestSlot)}</p>
                <p className="text-[13px] text-text-sub">
                  응답자 {totalResponded}명 중 {bestSlot.count}명이 가능해요
                </p>
              </div>
            )}

            <div className="bg-[#FFF8F5] border border-[#FFD6C0] rounded-2xl p-4">
              <p className="text-[12px] text-text-sub leading-relaxed">
                이 시간에 참여하지 못하는 분이 있을 수 있어요. 확정 후 개별적으로 안내해주세요.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:opacity-90 transition-opacity"
        >
          이 시간으로 확정하기
        </button>
      </div>
    </Shell>
  );
}
