'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, getCurrentCode, saveMeeting, findIntersection, Meeting, TimeSlot, formatSlot } from '@/lib/store';

export default function HostResult() {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [intersection, setIntersection] = useState<TimeSlot[]>([]);
  const [selected, setSelected] = useState<TimeSlot | null>(null);

  useEffect(() => {
    const code = getCurrentCode();
    if (!code) { router.replace('/'); return; }
    const m = getMeeting(code);
    if (!m) { router.replace('/'); return; }
    setMeeting(m);
    const inter = findIntersection(m.participants);
    setIntersection(inter);
    if (inter.length > 0) setSelected(inter[0]);
  }, [router]);

  if (!meeting) return null;

  function handleConfirm() {
    if (!selected || !meeting) return;
    const updated = { ...meeting, status: 'confirmed' as const, confirmedSlot: selected };
    saveMeeting(updated);
    router.push('/host/confirmed');
  }

  const totalCount = meeting.participants.filter(p => p.responded).length;

  function slotParticipantCount(slot: TimeSlot) {
    const key = `${slot.date}-${slot.hour}`;
    return meeting!.participants.filter(p =>
      p.responded && p.availableSlots.some(s => `${s.date}-${s.hour}` === key)
    ).length;
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
        {intersection.length > 0 ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎉</span>
              <h1 className="text-[22px] font-bold text-text-main">모두 가능한 시간이에요</h1>
            </div>
            <p className="text-sm text-text-sub mb-6">하나를 선택해서 확정해주세요</p>

            <div className="space-y-3 mb-6">
              {intersection.map((slot, i) => {
                const count = slotParticipantCount(slot);
                const key = `${slot.date}-${slot.hour}`;
                const isSelected = selected && `${selected.date}-${selected.hour}` === key;
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(slot)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-light'
                        : 'border-border bg-surface hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[15px] font-semibold ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                        {formatSlot(slot)}
                      </span>
                      <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-primary text-white' : 'bg-border text-text-sub'
                      }`}>
                        {count}/{totalCount}명
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => router.push('/host/suggest')}
              className="text-[13px] text-text-sub underline underline-offset-2"
            >
              교집합이 없는 경우 보기 →
            </button>
          </>
        ) : (
          <>
            <h1 className="text-[22px] font-bold text-text-main mb-1">겹치는 시간이 없어요</h1>
            <p className="text-sm text-text-sub mb-6">조율이 필요한 참여자에게 제안을 보낼게요</p>
            <button
              onClick={() => router.push('/host/suggest')}
              className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px]"
            >
              대안 확인하기
            </button>
          </>
        )}
      </div>

      {intersection.length > 0 && (
        <div className="px-5 pb-8 pt-4">
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:opacity-90 transition-opacity"
          >
            이 시간으로 확정하기
          </button>
        </div>
      )}
    </Shell>
  );
}
