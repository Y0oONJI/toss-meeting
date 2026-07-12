'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { generateCode, saveMeeting, saveCurrentCode, createDemoParticipants, getNextMonday } from '@/lib/store';

export default function HostCreate() {
  const router = useRouter();
  const nextMon = getNextMonday();
  const nextFri = (() => {
    const d = new Date(nextMon + 'T00:00:00');
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  })();
  const defaultDeadline = (() => {
    const d = new Date(nextMon + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  const [title, setTitle] = useState('');
  const [headcount, setHeadcount] = useState(6);
  const [startDate, setStartDate] = useState(nextMon);
  const [endDate, setEndDate] = useState(nextFri);
  const [deadline, setDeadline] = useState(defaultDeadline);

  const canProceed = title.trim() && headcount >= 2 && startDate && endDate && deadline;

  function handleCreate() {
    if (!canProceed) return;
    const code = generateCode();
    const meeting = {
      code,
      title: title.trim(),
      headcount,
      startDate,
      endDate,
      deadline,
      participants: createDemoParticipants(startDate, headcount),
      status: 'collecting' as const,
      confirmedSlot: null,
      coordinationRound: 0,
    };
    saveMeeting(meeting);
    saveCurrentCode(code);
    router.push('/host/share');
  }

  return (
    <Shell>
      <div className="flex items-center px-5 pt-5 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center -ml-1 text-text-main">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className="flex-1 px-5 pb-4 overflow-y-auto">
        <h1 className="text-[22px] font-bold text-text-main mb-1">어떤 회의인가요?</h1>
        <p className="text-sm text-text-sub mb-8">기본 정보를 입력해주세요</p>

        <div className="space-y-6">
          <div>
            <label className="block text-[13px] font-semibold text-text-main mb-2">회의 제목</label>
            <input
              type="text"
              placeholder="예: Q3 전략 회의"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full h-12 px-4 border-2 border-border rounded-xl text-[15px] text-text-main placeholder:text-text-sub focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text-main mb-2">참여 인원</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setHeadcount(h => Math.max(2, h - 1))}
                className="w-11 h-11 rounded-xl border-2 border-border text-[20px] font-light text-text-main flex items-center justify-center"
              >
                −
              </button>
              <span className="text-[22px] font-bold text-text-main w-10 text-center">{headcount}</span>
              <button
                onClick={() => setHeadcount(h => Math.min(20, h + 1))}
                className="w-11 h-11 rounded-xl border-2 border-border text-[20px] font-light text-text-main flex items-center justify-center"
              >
                +
              </button>
              <span className="text-[13px] text-text-sub">명</span>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text-main mb-2">회의 가능 기간</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-[11px] text-text-sub mb-1">시작일</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full h-12 px-3 border-2 border-border rounded-xl text-[14px] text-text-main focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <span className="block text-[11px] text-text-sub mb-1">종료일</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full h-12 px-3 border-2 border-border rounded-xl text-[14px] text-text-main focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-text-main mb-2">응답 마감일</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full h-12 px-4 border-2 border-border rounded-xl text-[15px] text-text-main focus:outline-none focus:border-primary transition-colors"
            />
            <p className="text-[11px] text-text-sub mt-1.5">마감일까지 응답하지 않은 참여자는 계산에서 제외돼요</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          onClick={handleCreate}
          disabled={!canProceed}
          className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] disabled:opacity-40 active:opacity-90 transition-opacity"
        >
          초대 링크 만들기
        </button>
      </div>
    </Shell>
  );
}
