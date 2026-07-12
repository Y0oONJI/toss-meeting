'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, saveMeeting, getCurrentCode, getCurrentParticipantId, Meeting, TimeSlot, formatSlot } from '@/lib/store';

export default function JoinAdjust() {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<TimeSlot | null>(null);
  const [customInput, setCustomInput] = useState(false);

  useEffect(() => {
    const code = getCurrentCode();
    const pid = getCurrentParticipantId();
    if (!code || !pid) { router.replace('/'); return; }
    const m = getMeeting(code);
    if (!m) { router.replace('/'); return; }
    setMeeting(m);
    setMyId(pid);
    const me = m.participants.find(p => p.id === pid);
    if (me?.suggestedSlots?.[0]) setSelected(me.suggestedSlots[0]);
  }, [router]);

  if (!meeting || !myId) return null;

  const me = meeting.participants.find(p => p.id === myId);
  const suggestedSlots = me?.suggestedSlots ?? [];

  function handleSubmit() {
    if (!selected || !meeting || !myId) return;
    const updated = {
      ...meeting,
      participants: meeting.participants.map(p =>
        p.id === myId
          ? { ...p, availableSlots: [...p.availableSlots, selected], adjustmentRequested: false }
          : p
      ),
    };
    saveMeeting(updated);
    router.push('/join/status');
  }

  return (
    <Shell>
      <div className="flex items-center px-5 pt-5 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center -ml-1 text-text-main">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className="flex-1 px-5 pb-4 overflow-y-auto">
        <h1 className="text-[22px] font-bold text-text-main mb-1">조율이 필요해요</h1>
        <p className="text-sm text-text-sub mb-6">
          조율자가 제안한 시간이에요. 가능하다면 선택해주세요
        </p>

        <div className="space-y-3 mb-6">
          {suggestedSlots.map((slot, i) => {
            const key = `${slot.date}-${slot.hour}`;
            const isSelected = selected && `${selected.date}-${selected.hour}` === key;
            return (
              <button
                key={i}
                onClick={() => { setSelected(slot); setCustomInput(false); }}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected ? 'border-primary bg-primary-light' : 'border-border bg-surface'
                }`}
              >
                <span className={`text-[15px] font-semibold ${isSelected ? 'text-primary' : 'text-text-main'}`}>
                  {formatSlot(slot)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-[12px] font-semibold text-text-sub mb-3">위 시간이 모두 어렵다면</p>
          {!customInput ? (
            <button
              onClick={() => { setCustomInput(true); setSelected(null); }}
              className="w-full h-11 border-2 border-dashed border-border rounded-xl text-[13px] text-text-sub font-medium"
            >
              + 다른 시간 제안하기
            </button>
          ) : (
            <p className="text-[13px] text-text-sub text-center py-3">
              조율자에게 직접 연락해서 가능한 시간을 알려주세요
            </p>
          )}
        </div>
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:opacity-90 transition-opacity"
        >
          제출하기
        </button>
      </div>
    </Shell>
  );
}
