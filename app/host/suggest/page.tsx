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

  const canCount = topSlot ? topSlot.count : 0;
  const needsAdjustmentCount = meeting.participants.filter(p => {
    if (!p.responded || !topSlot) return false;
    return !p.availableSlots.some(s => `${s.date}-${s.hour}` === `${topSlot.date}-${topSlot.hour}`);
  }).length;

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
    setMeeting(updated);
    setSent(true);
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
        {!sent ? (
          <>
            <h1 className="text-[22px] font-bold text-text-main mb-1">모두가 가능한 시간이 없어요</h1>
            <p className="text-sm text-text-sub mb-6">
              가장 많은 사람이 선택한 시간을 제안해볼게요
            </p>

            {topSlot && (
              <div className="bg-surface rounded-2xl p-5 mb-4">
                <p className="text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-2">제안할 시간</p>
                <p className="text-[20px] font-bold text-text-main mb-1">{formatSlot(topSlot)}</p>
                <p className="text-[13px] text-text-sub">
                  응답자 {totalResponded}명 중 {canCount}명이 가능한 시간이에요
                </p>
              </div>
            )}

            <div className="bg-[#FFF8F5] border border-[#FFD6C0] rounded-2xl p-4 mb-6">
              <p className="text-[13px] font-semibold text-warn mb-1">
                {needsAdjustmentCount}명에게 확인이 필요해요
              </p>
              <p className="text-[12px] text-text-sub leading-relaxed">
                이 시간에 응답하지 않은 참여자들에게 "이 시간으로 가능한가요?"라는 확인 요청이 전달돼요. 참여자가 링크에 재접속하면 확인할 수 있어요.
              </p>
            </div>

            {meeting.coordinationRound >= 2 && (
              <button
                onClick={() => router.push('/host/majority')}
                className="w-full text-[13px] text-text-sub underline underline-offset-2 mb-4"
              >
                다수결로 결정하기
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mb-5">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14l6 6 10-10" stroke="#3182F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[18px] font-bold text-text-main mb-2">제안을 전달했어요</p>
              <p className="text-[13px] text-text-sub leading-relaxed">
                참여자들이 링크에 재접속하면<br/>제안된 시간을 확인할 수 있어요
              </p>
            </div>

            {meeting.coordinationRound >= 2 && (
              <div className="bg-[#FFF8F5] border border-[#FFD6C0] rounded-2xl p-4 mb-4">
                <p className="text-[13px] font-semibold text-warn mb-1">2회 이상 조율이 필요해요</p>
                <p className="text-[12px] text-text-sub">합의가 어려운 경우 다수결로 결정할 수 있어요</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-5 pb-8 pt-4 space-y-3">
        {!sent ? (
          <button
            onClick={handleSendRequest}
            className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] active:opacity-90 transition-opacity"
          >
            이 시간으로 제안 보내기
          </button>
        ) : (
          <>
            {meeting.coordinationRound >= 2 && (
              <button
                onClick={() => router.push('/host/majority')}
                className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px]"
              >
                다수결로 확정하기
              </button>
            )}
            <button
              onClick={() => router.push('/host/result')}
              className="w-full h-12 border-2 border-border rounded-2xl font-semibold text-[14px] text-text-main"
            >
              결과 다시 확인하기
            </button>
          </>
        )}
      </div>
    </Shell>
  );
}
