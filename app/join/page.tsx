'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { getMeeting, saveCurrentCode } from '@/lib/store';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleJoin() {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) {
      setError('코드를 입력해주세요');
      return;
    }
    const meeting = getMeeting(trimmed);
    if (!meeting) {
      setError('유효하지 않은 코드예요. 다시 확인해주세요');
      return;
    }
    if (meeting.status === 'confirmed') {
      saveCurrentCode(trimmed);
      router.push('/join/done');
      return;
    }
    saveCurrentCode(trimmed);
    router.push('/join/info');
  }

  return (
    <Shell>
      <div className="flex items-center px-5 pt-5 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center -ml-1 text-text-main">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-4">
        <h1 className="text-[22px] font-bold text-text-main mb-1">초대 코드를<br/>입력해주세요</h1>
        <p className="text-sm text-text-sub mb-8">조율자에게 받은 코드를 입력하세요</p>

        <input
          type="text"
          placeholder="예: AB1234"
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
          maxLength={8}
          className="w-full h-16 px-4 border-2 border-border rounded-2xl text-[28px] font-bold tracking-[0.2em] text-center text-text-main placeholder:text-border focus:outline-none focus:border-primary transition-colors"
        />
        {error && <p className="text-[13px] text-red-500 mt-2 text-center">{error}</p>}

        <div className="mt-auto"/>
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          onClick={handleJoin}
          disabled={!code.trim()}
          className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:opacity-90 transition-opacity"
        >
          참여하기
        </button>
      </div>
    </Shell>
  );
}
