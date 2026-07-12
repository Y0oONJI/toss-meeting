'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, getCurrentCode, saveMeeting, findBestSlots, Meeting, formatSlot } from '@/lib/store';

export default function HostSuggest() {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const code = getCurrentCode();
    if (!code) { router.replace('/'); return; }
    const m = getMeeting(code);
    if (!m) { router.replace('/'); return; }
    setMeeting(m);
  }, [router]);

  if (!meeting) return null;

  const bestSlots = findBestSlots(meeting.participants);
  const topSlot = bestSlots[0] ?? null;
  const totalResponded = meeting.participants.filter(p => p.responded).length;

  function handleSendRequest() {
    if (!meeting || !topSlot) return;
    const updated = {
      ...meeting,
      coordinationRound: meeting.coordinationRound + 1,
      participants: meeting.participants.map(p => {
        const hasTopSlot = p.availableSlots.some(s => `${s.date}-${s.hour}` === `${topSlot.date}-${topSlot.hour}`);
        if (!hasTopSlot && p.responded) {
          return { ...p, adjustmentRequested: true, suggestedSlots: [topSlot] };
        }
        return p;
      }),
    };
    saveMeeting(updated);
    setSent(true);
  }

  const needsAdjustmentCount = meeting.participants.filter(p => {
    if (!p.responded) return false;
    if (!topSlot) return false;
    return !p.availableSlots.some(s => `${s.date}-${s.hour}` === `${topSlot.date}-${topSlot.hour}`);
  }).length;

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
        <h1 className="text-[22px] font-bold text-text-main mb-1">겹치는 시간이 없어요</h1>
        <p className="text-sm text-text-sub mb-6">가장 많이 선택된 시간을 기준으로 조율을 요청할게요</p>

        <div className="bg-[#FFF8F5] border border-[#FFD6C0] rounded-2xl p-4 mb-4">
          <p className="text-[12px] font-semibold text-warn mb-1">
            {needsAdjustmentCount}명 조율 필요
          </p>
          <p className="text-[13px] text-text-sub">
            이 분들에게 아래 시간으로 조율 요청을 보낼게요
          </p>
        </div>

        {topSlot && (
          <div className="bg-surface rounded-2xl p-4 mb-6">
            <p className="text-[11px] font-semibold text-text-sub mb-2">추천 시간</p>
            <p className="text-[17px] font-bold text-text-main">{formatSlot(topSlot)}</p>
            <p className="text-[12px] text-text-sub mt-1">
              {topSlot.count}/{totalResponded}명이 가능한 시간
            </p>
          </div>
        )}

        {meeting.coordinationRound >= 2 && (
          <button
            onClick={() => router.push('/host/majority')}
            className="w-full text-[13px] text-text-sub underline underline-offset-2 mb-4"
          >
            다수결로 결정하기 →
          </button>
        )}

        {sent && (
          <div className="bg-primary-light rounded-xl p-3 mb-4">
            <p className="text-[13px] font-semibold text-primary text-center">
              ✓ 조율 요청을 보냈어요. 참여자들이 링크에 재접속하면 제안을 볼 수 있어요.
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pb-8 pt-4 space-y-3">
        {!sent ? (
          <button
            onClick={handleSendRequest}
            className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] active:opacity-90 transition-opacity"
          >
            조율 요청 보내기
          </button>
        ) : (
          <>
            <button
              onClick={() => router.push('/host/majority')}
              className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px]"
            >
              다수결로 확정하기
            </button>
            <button
              onClick={() => router.push('/host/result')}
              className="w-full h-12 border-2 border-border rounded-2xl font-semibold text-[14px] text-text-main"
            >
              결과 다시 확인
            </button>
          </>
        )}
      </div>
    </Shell>
  );
}
