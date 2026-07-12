'use client';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';

export default function Home() {
  const router = useRouter();
  return (
    <Shell>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="6" width="24" height="22" rx="3" stroke="white" strokeWidth="2.5"/>
              <path d="M4 12h24" stroke="white" strokeWidth="2.5"/>
              <rect x="10" y="4" width="2.5" height="5" rx="1.25" fill="white"/>
              <rect x="19.5" y="4" width="2.5" height="5" rx="1.25" fill="white"/>
              <rect x="8" y="17" width="5" height="5" rx="1" fill="white"/>
              <rect x="13.5" y="17" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
              <rect x="19" y="17" width="5" height="5" rx="1" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <h1 className="text-[26px] font-bold text-text-main leading-snug mb-2">
            회의 시간,<br/>같이 맞춰봐요
          </h1>
          <p className="text-sm text-text-sub leading-relaxed mt-3">
            6명, 1시간, 다음 주까지<br/>시스템이 가장 좋은 시간을 찾아드려요
          </p>
        </div>
        <div className="w-full space-y-3">
          <button
            onClick={() => router.push('/host/create')}
            className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] active:opacity-90 transition-opacity"
          >
            조율자로 시작하기
          </button>
          <button
            onClick={() => router.push('/join')}
            className="w-full h-14 border-2 border-border text-text-main rounded-2xl font-semibold text-[15px] active:opacity-80 transition-opacity"
          >
            참여자로 참여하기
          </button>
        </div>
      </div>
    </Shell>
  );
}
