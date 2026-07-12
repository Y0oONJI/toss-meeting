'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, getCurrentCode, Meeting, formatSlot } from '@/lib/store';

export default function HostConfirmed() {
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

  if (!meeting || !meeting.confirmedSlot) return null;

  const timeStr = formatSlot(meeting.confirmedSlot);

  function handleCopy() {
    navigator.clipboard.writeText(`📅 ${meeting!.title}\n🕐 ${timeStr}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Shell>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mb-6">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M8 18l7 7 13-13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="text-[24px] font-bold text-text-main text-center mb-2">
          회의가 확정됐어요!
        </h1>
        <p className="text-sm text-text-sub text-center mb-8">
          모든 참여자에게 알림이 전달돼요
        </p>

        <div className="w-full bg-surface rounded-2xl p-5 mb-6">
          <p className="text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-1">회의명</p>
          <p className="text-[17px] font-bold text-text-main mb-4">{meeting.title}</p>
          <p className="text-[11px] font-semibold text-text-sub uppercase tracking-wider mb-1">확정 시간</p>
          <p className="text-[20px] font-bold text-primary">{timeStr}</p>
          <p className="text-[12px] text-text-sub mt-0.5">1시간 · {meeting.participants.length}명</p>
        </div>

        <button
          onClick={handleCopy}
          className="w-full h-12 border-2 border-border rounded-2xl font-semibold text-[14px] text-text-main mb-3"
        >
          {copied ? '✓ 복사됨' : '일정 텍스트 복사하기'}
        </button>

        <button
          onClick={() => router.push('/')}
          className="text-[13px] text-text-sub underline underline-offset-2"
        >
          처음으로 돌아가기
        </button>
      </div>
    </Shell>
  );
}
