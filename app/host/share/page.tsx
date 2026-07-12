'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, getCurrentCode, Meeting } from '@/lib/store';

export default function HostShare() {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const code = getCurrentCode();
    if (!code) { router.replace('/'); return; }
    const m = getMeeting(code);
    if (!m) { router.replace('/'); return; }
    setMeeting(m);
  }, [router]);

  if (!meeting) return null;

  const responded = meeting.participants.filter(p => p.responded).length;
  const total = meeting.headcount;
  const progress = Math.round((responded / total) * 100);
  const canCheck = responded > 0;

  function copyLink() {
    navigator.clipboard.writeText(`회의 코드: ${meeting!.code}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <h1 className="text-[22px] font-bold text-text-main mb-1">초대 코드를 공유해요</h1>
        <p className="text-sm text-text-sub mb-6">참여자들이 이 코드로 입장할 수 있어요</p>

        <div className="bg-surface rounded-2xl p-5 mb-4">
          <p className="text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-2">초대 코드</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl font-bold tracking-[0.15em] text-text-main">{meeting.code}</span>
          </div>
          <button
            onClick={copyLink}
            className="w-full h-11 border-2 border-border rounded-xl text-[14px] font-semibold text-text-main active:bg-surface transition-colors"
          >
            {copied ? '복사됨' : '코드 복사하기'}
          </button>
        </div>

        <div className="bg-surface rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-semibold text-text-main">응답 현황</p>
            <span className="text-[13px] font-bold text-primary">{responded}/{total}명</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[12px] text-text-sub">
            마감일 {meeting.deadline}까지 응답하지 않은 참여자는 계산에서 제외돼요
          </p>
        </div>
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          onClick={() => router.push('/host/result')}
          disabled={!canCheck}
          className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:opacity-90 transition-opacity"
        >
          결과 확인하기
        </button>
      </div>
    </Shell>
  );
}
