import { useState } from 'react';
import { X } from 'lucide-react';
import { useLocale } from '../../core/locale/LocaleContext';
import type { AvailabilitySlot } from '../../core/network/tutorsApi';

interface Props {
  tutorName: string;
  selectedDate: string;
  slots: AvailabilitySlot[];
  bookingInProgress?: boolean;
  onClose: () => void;
  onBook: (slot: AvailabilitySlot) => void;
}

export default function ViewScheduleModal({
  tutorName,
  selectedDate,
  slots,
  bookingInProgress = false,
  onClose,
  onBook,
}: Props) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const { userTz } = useLocale();

  const sortedSlots = [...slots].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const selectedSlot = sortedSlots.find((slot) => slot.id === selectedSlotId) ?? null;

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
        <div className="px-6 py-2.5 bg-[#E8F5E9] border-b border-[#C8E6C9] text-xs text-[#2E7D32]">
          🕒 Times shown in your timezone ({userTz}).
        </div>

        {/* Legend */}
        <div className="flex gap-4 px-6 py-3 border-b border-[#EEEEEE] text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#BBF7D0] border border-[#14783D]" />
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[#43A047]" />
            <span className="text-gray-600">Selected</span>
          </div>
        </div>

        {/* Slots Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {sortedSlots.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No available slots on this day.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {sortedSlots.map((slot) => {
                const selected = selectedSlotId === slot.id;
                const start = new Date(slot.startTime);
                const end = new Date(slot.endTime);
                const displayTime = `${start.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })} - ${end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
                return (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all flex flex-col items-center ${
                      selected
                        ? 'bg-[#43A047] border-[#43A047] text-white'
                        : 'bg-[#BBF7D0] border-[#14783D] text-[#14783D] hover:border-[#43A047]'
                    }`}
                  >
                    <span>{displayTime}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#EEEEEE]">
          <button
            disabled={!selectedSlot || bookingInProgress}
            onClick={() => selectedSlot && onBook(selectedSlot)}
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bookingInProgress ? 'Booking…' : selectedSlot ? 'Book Selected Slot' : 'Select a time slot'}
          </button>
        </div>
      </div>
    </div>
  );
}
