'use client';
import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function DatePicker({ value, onChange, min, max }: Props) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    return d.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = value ? new Date(value + 'T00:00:00') : new Date();
    return d.getMonth();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function formatDisplay(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${days[d.getDay()]})`;
  }

  function toDateStr(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function isDisabled(dateStr: string) {
    if (min && dateStr < min) return true;
    if (max && dateStr > max) return true;
    return false;
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleOpen() {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
    setOpen(o => !o);
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const cells: Array<{ day: number | null; dateStr: string | null }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: toDateStr(viewYear, viewMonth, d) });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, dateStr: null });

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full h-12 px-3 border-2 rounded-xl text-[14px] text-left flex items-center transition-colors ${
          value ? 'text-text-main' : 'text-text-sub'
        } ${open ? 'border-primary' : 'border-border'}`}
      >
        {value ? formatDisplay(value) : '날짜 선택'}
      </button>

      {open && (
        <div className="absolute left-0 top-[52px] z-50 bg-white rounded-2xl shadow-lg border border-border p-4 w-64">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface text-text-sub"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="text-[13px] font-bold text-text-main">{viewYear}년 {viewMonth + 1}월</span>
            <button
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface text-text-sub"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 11l4-4-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_NAMES.map((d, i) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold py-0.5"
                style={{ color: i === 0 ? '#FF3B30' : i === 6 ? '#3182F6' : '#868E96' }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              if (!cell.day || !cell.dateStr) return <div key={i} className="h-8" />;
              const isSelected = cell.dateStr === value;
              const disabled = isDisabled(cell.dateStr);
              const col = i % 7;
              const defaultColor = col === 0 ? '#FF3B30' : col === 6 ? '#3182F6' : '#191F28';
              return (
                <button
                  key={i}
                  onClick={() => { if (!disabled) { onChange(cell.dateStr!); setOpen(false); } }}
                  disabled={disabled}
                  className="h-8 w-8 mx-auto rounded-full text-[12px] font-medium transition-colors flex items-center justify-center"
                  style={{
                    backgroundColor: isSelected ? '#3182F6' : 'transparent',
                    color: isSelected ? '#fff' : disabled ? '#D1D5DB' : defaultColor,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
