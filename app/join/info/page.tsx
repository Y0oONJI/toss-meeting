'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, saveMeeting, getCurrentCode, getCurrentParticipantId, saveCurrentParticipantId } from '@/lib/store';

export default function JoinInfo() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [role, setRole] = useState<'required' | 'optional'>('required');

  const canProceed = name.trim();

  function handleNext() {
    if (!canProceed) return;
    const code = getCurrentCode();
    if (!code) { router.replace('/'); return; }
    const meeting = getMeeting(code);
    if (!meeting) { router.replace('/'); return; }

    // 이미 이 세션에서 추가된 참여자가 있으면 재사용
    const existingId = getCurrentParticipantId();
    const existing = existingId ? meeting.participants.find(p => p.id === existingId) : null;

    if (existing) {
      const updated = {
        ...meeting,
        participants: meeting.participants.map(p =>
          p.id === existingId ? { ...p, name: name.trim(), role } : p
        ),
      };
      saveMeeting(updated);
      router.push('/join/overview');
      return;
    }

    const id = `user-${Date.now()}`;
    const newParticipant = {
      id,
      name: name.trim(),
      position: '',
      role,
      availableSlots: [],
      responded: false,
      adjustmentRequested: false,
      suggestedSlots: [],
    };
    const updated = {
      ...meeting,
      participants: [...meeting.participants, newParticipant],
    };
    saveMeeting(updated);
    saveCurrentParticipantId(id);
    router.push('/join/overview');
  }

  return (
    <Shell>
      <div className="flex items-center px-5 pt-5 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center -ml-1 text-text-main">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className="px-5 mb-4">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: '33%' }}/>
        </div>
      </div>

      <div className="flex-1 px-5 pb-4 overflow-y-auto">
        <h1 className="text-[22px] font-bold text-text-main mb-1">어떻게 참석하시나요?</h1>
        <p className="text-sm text-text-sub mb-8">다른 참여자에게는 익명으로 보여요</p>

        <div className="space-y-6">
          <div>
            <label className="block text-[13px] font-semibold text-text-main mb-2">이름</label>
            <input
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-12 px-4 border-2 border-border rounded-xl text-[15px] text-text-main placeholder:text-text-sub focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text-main mb-2">참석 유형</label>
            <div className="grid grid-cols-2 gap-2">
              {(['required', 'optional'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`h-11 rounded-xl text-[14px] font-semibold border-2 transition-all ${
                    role === r
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-border bg-white text-text-sub'
                  }`}
                >
                  {r === 'required' ? '꼭 참석' : '가능하면 참석'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-sub mt-2">
              {role === 'required'
                ? '내 일정이 우선 기준이 돼요'
                : '맞으면 참석하는 거예요'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:opacity-90 transition-opacity"
        >
          다음
        </button>
      </div>
    </Shell>
  );
}
