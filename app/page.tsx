'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { seedDemoMeeting, seedDemo2Meeting, saveCurrentCode, clearSessionState, DEMO_CODE, DEMO02_CODE } from '@/lib/store';

const SCENARIOS = [
  {
    num: '01',
    color: '#3182F6',
    title: '모두 가능한 시간이 있을 때',
    code: DEMO_CODE,
    path: '/host/share',
  },
  {
    num: '02',
    color: '#FF6B2B',
    title: '시간이 전혀 겹치지 않을 때',
    code: DEMO02_CODE,
    path: '/host/suggest',
  },
  {
    num: '03',
    color: '#00C471',
    title: '참여자로 직접 참여해보기',
    code: DEMO_CODE,
    path: '/join/info',
  },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    clearSessionState();
    seedDemoMeeting();
    seedDemo2Meeting();
  }, []);

  function enter(code: string, path: string) {
    saveCurrentCode(code);
    router.push(path);
  }

  return (
    <Shell>
      <div className="flex-1 flex flex-col px-5 pt-12 pb-10">

        {/* 로고 + 타이틀 */}
        <div className="mb-10">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-5">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <rect x="3" y="5" width="20" height="18" rx="3" stroke="white" strokeWidth="2.2"/>
              <path d="M3 10h20" stroke="white" strokeWidth="2.2"/>
              <rect x="8" y="3" width="2" height="4" rx="1" fill="white"/>
              <rect x="16" y="3" width="2" height="4" rx="1" fill="white"/>
              <rect x="7" y="14" width="4" height="4" rx="1" fill="white"/>
              <rect x="11" y="14" width="4" height="4" rx="1" fill="white" opacity="0.6"/>
              <rect x="15" y="14" width="4" height="4" rx="1" fill="white" opacity="0.3"/>
            </svg>
          </div>
          <h1 className="text-[28px] font-bold text-text-main leading-tight">
            더 쉬운<br />회의 일정잡기
          </h1>
          <p className="text-[15px] text-text-sub mt-2">hey와 함께 해요</p>
        </div>

        {/* 메인 CTA */}
        <div className="space-y-3 mb-10">
          <button
            onClick={() => router.push('/host/create')}
            className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] active:opacity-90 transition-opacity"
          >
            회의 만들기
          </button>
          <button
            onClick={() => router.push('/join')}
            className="w-full h-14 border-2 border-border text-text-main rounded-2xl font-semibold text-[15px] active:opacity-80 transition-opacity"
          >
            코드로 참여하기
          </button>
        </div>

        {/* 시나리오 데모 — 보조 */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border"/>
            <span className="text-[11px] font-semibold text-text-sub tracking-wider">데모 시나리오</span>
            <div className="flex-1 h-px bg-border"/>
          </div>

          <div className="space-y-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.num}
                onClick={() => enter(s.code, s.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface active:opacity-70 transition-opacity text-left"
              >
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0"
                  style={{ color: s.color, backgroundColor: `${s.color}18` }}
                >
                  {s.num}
                </span>
                <span className="text-[13px] font-medium text-text-main flex-1">{s.title}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-text-sub">
                  <path d="M5 10.5l4-3.5-4-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        </div>

      </div>
    </Shell>
  );
}
