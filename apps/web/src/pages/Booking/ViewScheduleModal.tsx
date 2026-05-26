import { useState } from 'react';
import { X } from 'lucide-react';
import { TIME_SLOTS } from '../../data/mockData';
import { useLocale } from '../../core/locale/LocaleContext';
import { slotToUserTime, tzAbbr } from '../../core/utils/timezone';

interface Props {
  tutorName: string;
  selectedDate: string;
  tutorTz?: string;
  onClose: () => void;
  onBook: (timeSlot: string) => void;
}

// Simulate some slots as reserved
const RESERVED_SLOTS = ['8:00 AM', '9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];

export default function ViewScheduleModal({ tutorName, selectedDate, tutorTz, onClose, onBook }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const { userTz } = useLocale();
  const showTz = !!tutorTz && tutorTz !== userTz;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEE]">
          <div>
            <h2 className="font-bold text-gray-900">View Schedule</h2>
            <p className="text-xs text-gray-500">{tutorName} · {selectedDate}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Timezone info banner */}
        {showTz && (
          <div className="px-6 py-2.5 bg-[#E8F5E9] border-b border-[#C8E6C9] text-xs text-[#2E7D32]">
            🕒 Times in your timezone ({tzAbbr(userTz)}). Tutor is in ({tzAbbr(tutorTz!)}).
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 px-6 py-3 border-b border-[#EEEEEE] text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#BBF7D0] border border-[#14783D]" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
            <span className="text-gray-400">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#43A047]" />
            <span className="text-gray-600">Selected</span>
          </div>
        </div>

        {/* Slots Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => {
              const reserved = RESERVED_SLOTS.includes(slot);
              const selected = selectedSlot === slot;
              const displayTime = showTz ? slotToUserTime(slot, tutorTz!, userTz) : slot;
              return (
                <button
                  key={slot}
                  disabled={reserved}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex flex-col items-center ${
                    reserved
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      : selected
                      ? 'bg-[#43A047] border-[#43A047] text-white'
                      : 'bg-[#BBF7D0] border-[#14783D] text-[#14783D] hover:border-[#43A047]'
                  }`}
                >
                  <span>{displayTime}</span>
                  {showTz && displayTime !== slot && (
                    <span className="text-[10px] opacity-60">{slot}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#EEEEEE]">
          <button
            disabled={!selectedSlot}
            onClick={() => selectedSlot && onBook(selectedSlot)}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedSlot
              ? `Book ${showTz ? slotToUserTime(selectedSlot, tutorTz!, userTz) : selectedSlot}`
              : 'Select a time slot'}
          </button>
        </div>
      </div>
    </div>
  );
}
