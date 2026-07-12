'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { seedDemoMeeting, seedDemo2Meeting, saveCurrentCode, DEMO_CODE, DEMO02_CODE } from '@/lib/store';

const SCENARIOS = [
  {
    num: '01',
    numColor: '#3182F6',
    numBg: '#EBF3FE',
    title: '모두 가능한 시간이 있을 때',
    desc: '5명이 이미 응답했어요. 교집합을 확인하고 바로 확정해보세요.',
    label: '조율자 화면으로 체험',
    code: DEMO_CODE,
    path: '/host/share',
  },
  {
    num: '02',
    numColor: '#FF6B2B',
    numBg: '#FFF0EA',
    title: '시간이 전혀 겹치지 않을 때',
    desc: '필수 참여자들의 시간이 겹치지 않아요. 조율 요청을 보내보세요.',
    label: '조율자 화면으로 체험',
    code: DEMO02_CODE,
    path: '/host/suggest',
  },
  {
    num: '03',
    numColor: '#00C471',
    numBg: '#E6FAF2',
    title: '참여자로 직접 참여해보기',
    desc: '다른 참여자들의 현황을 보고 내 시간을 직접 입력해보세요.',
    label: '참여자 화면으로 체험',
    code: DEMO_CODE,
    path: '/join/info',
  },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
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

        <p className="text-[13px] font-semibold text-text-sub mb-3 tracking-wide uppercase">시나리오 체험</p>

        <div className="space-y-3 mb-10">
          {SCENARIOS.map((s) => (
            <button
              key={s.num}
              onClick={() => enter(s.code, s.path)}
              className="w-full text-left bg-surface border-2 border-border rounded-2xl p-4 active:opacity-80 transition-opacity"
            >
              <div className="flex items-start gap-3">
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                  style={{ color: s.numColor, backgroundColor: s.numBg }}
                >
                  {s.num}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-text-main mb-0.5">{s.title}</p>
                  <p className="text-[12px] text-text-sub leading-snug mb-3">{s.desc}</p>
                  <span
                    className="inline-flex items-center gap-1 text-[12px] font-semibold"
                    style={{ color: s.numColor }}
                  >
                    {s.label}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6h7m-3-3 3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-center gap-5">
          <button
            onClick={() => router.push('/host/create')}
            className="text-[13px] text-text-sub font-medium"
          >
            직접 만들기
          </button>
          <div className="w-px h-3 bg-border"/>
          <button
            onClick={() => router.push('/join')}
            className="text-[13px] text-text-sub font-medium"
          >
            코드로 참여하기
          </button>
        </div>
      </div>
    </Shell>
  );
}
