'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, getCurrentCode, getCurrentParticipantId, saveCurrentCode, findBestSlots, Meeting, formatSlot, DEMO_CODE, DEMO02_CODE } from '@/lib/store';

export default function JoinStatus() {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const code = getCurrentCode();
    const pid = getCurrentParticipantId();
    if (!code || !pid) { router.replace('/'); return; }

    function refresh() {
      const m = getMeeting(code!);
      if (!m) { router.replace('/'); return; }
      setMeeting(m);
      setMyId(pid);
      if (m.status === 'confirmed') {
        router.push('/join/done');
      }
    }

    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [router]);

  if (!meeting) return null;

  const currentCode = getCurrentCode();
  const isDemoSession = currentCode === DEMO_CODE || currentCode === DEMO02_CODE;
  const myParticipant = myId ? meeting.participants.find(p => p.id === myId) : null;
  const needsAdjustment = myParticipant?.adjustmentRequested;
  const responded = meeting.participants.filter(p => p.responded).length;
  const total = meeting.participants.length;
  const bestSlots = findBestSlots(meeting.participants);

  return (
    <Shell>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="w-9"/>
        <span className="text-[13px] font-medium text-text-sub">{meeting.title}</span>
        <div className="w-9"/>
      </div>

      <div className="px-5 mb-4">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: '100%' }}/>
        </div>
      </div>

      <div className="flex-1 px-5 pb-4 overflow-y-auto">
        {needsAdjustment ? (
          <div className="bg-[#FFF8F5] border border-[#FFD6C0] rounded-2xl p-4 mb-5">
            <p className="text-[14px] font-bold text-warn mb-1">조율 요청이 왔어요</p>
            <p className="text-[13px] text-text-sub">내가 선택한 시간에 맞지 않는 분들이 있어요. 시간을 조율해줄 수 있나요?</p>
            <button
              onClick={() => router.push('/join/adjust')}
              className="mt-3 w-full h-10 bg-warn text-white rounded-xl font-semibold text-[13px]"
            >
              조율 제안 보기
            </button>
          </div>
        ) : (
          <div className="bg-primary-light rounded-2xl p-4 mb-5">
            <p className="text-[14px] font-bold text-primary mb-1">응답 완료</p>
            <p className="text-[13px] text-primary/70">조율자가 시간을 확정하면 이 화면이 업데이트돼요</p>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-text-main">지금까지 이런 시간을 원해요</h2>
          <span className="text-[12px] text-text-sub">{responded}/{total}명</span>
        </div>

        <div className="space-y-3">
          {bestSlots.length === 0 ? (
            <p className="text-[13px] text-text-sub text-center py-8">아직 응답이 모이는 중이에요</p>
          ) : (
            bestSlots.map((slot, i) => {
              const pct = Math.round((slot.count / responded) * 100);
              return (
                <div key={i} className="bg-surface rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] font-semibold text-text-main">{formatSlot(slot)}</span>
                    <span className="text-[11px] text-text-sub">{slot.count}명</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }}/>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="text-[11px] text-text-sub text-center mt-4">
          다른 참여자 정보는 익명으로 표시돼요
        </p>
      </div>

      <div className="px-5 pb-8 pt-2 space-y-3">
        {isDemoSession && (
          <button
            onClick={() => { saveCurrentCode(DEMO_CODE); router.push('/host/share'); }}
            className="w-full h-11 border-2 border-primary rounded-2xl text-[13px] font-semibold text-primary active:opacity-80 transition-opacity"
          >
            조율자 입장에서 결과 확인하기 →
          </button>
        )}
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/')}
            className="text-[13px] text-text-sub underline underline-offset-2"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    </Shell>
  );
}
