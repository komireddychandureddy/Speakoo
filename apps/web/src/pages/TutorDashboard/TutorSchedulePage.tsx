import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

type SlotStatus = 'available' | 'booked';

interface Slot {
  id: string;
  day: number; // 0=Mon ... 6=Sun
  hour: number; // 8–20
  status: SlotStatus;
  studentName?: string;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM – 8 PM
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SEED_SLOTS: Slot[] = [
  { id: '1', day: 0, hour: 10, status: 'booked', studentName: 'Aryan K.' },
  { id: '2', day: 0, hour: 14, status: 'available' },
  { id: '3', day: 1, hour: 9, status: 'available' },
  { id: '4', day: 1, hour: 11, status: 'booked', studentName: 'Fatima A.' },
  { id: '5', day: 2, hour: 15, status: 'available' },
  { id: '6', day: 3, hour: 10, status: 'available' },
  { id: '7', day: 3, hour: 16, status: 'booked', studentName: 'Liam P.' },
  { id: '8', day: 4, hour: 9, status: 'available' },
  { id: '9', day: 5, hour: 11, status: 'available' },
];

function fmt12(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}:00 ${suffix}`;
}

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function TutorSchedulePage() {
  const [slots, setSlots] = useState<Slot[]>(SEED_SLOTS);
  const [weekOffset, setWeekOffset] = useState(0);
  const [addModal, setAddModal] = useState<{ day: number; hour: number } | null>(null);

  const weekDates = getWeekDates(weekOffset);

  const getSlot = (day: number, hour: number) =>
    slots.find((s) => s.day === day && s.hour === hour);

  const addSlot = (day: number, hour: number) => {
    if (getSlot(day, hour)) return;
    const id = `${Date.now()}`;
    setSlots((prev) => [...prev, { id, day, hour, status: 'available' }]);
    setAddModal(null);
  };

  const removeSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const availableCount = slots.filter((s) => s.status === 'available').length;
  const bookedCount = slots.filter((s) => s.status === 'booked').length;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Schedule & Availability</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Click any empty cell to add an availability slot
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span className="w-3 h-3 rounded-sm bg-[#43A047] inline-block" /> Available ({availableCount})
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span className="w-3 h-3 rounded-sm bg-[#1565C0] inline-block" /> Booked ({bookedCount})
          </span>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="card px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="font-bold text-gray-900 text-sm">
              {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' – '}
              {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            {weekOffset === 0 && (
              <span className="text-xs text-[#43A047] font-semibold">Current Week</span>
            )}
          </div>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Column Headers */}
            <div className="grid grid-cols-8 gap-1 mb-1">
              <div className="text-xs text-gray-400 font-semibold text-center py-2">Time</div>
              {DAYS.map((d, i) => (
                <div key={d} className="text-center">
                  <p className="text-xs font-bold text-gray-700">{d}</p>
                  <p
                    className={`text-xs mt-0.5 ${
                      weekOffset === 0 && new Date().getDay() === (i + 1) % 7
                        ? 'text-[#43A047] font-bold'
                        : 'text-gray-400'
                    }`}
                  >
                    {weekDates[i].getDate()}
                  </p>
                </div>
              ))}
            </div>

            {/* Time rows */}
            <div className="space-y-0.5">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 gap-1 items-center">
                  <div className="text-xs text-gray-400 text-center py-1 font-medium">
                    {fmt12(hour)}
                  </div>
                  {DAYS.map((_, dayIdx) => {
                    const slot = getSlot(dayIdx, hour);
                    const isPast =
                      weekOffset < 0 ||
                      (weekOffset === 0 &&
                        (dayIdx < ((new Date().getDay() + 6) % 7) ||
                          (dayIdx === ((new Date().getDay() + 6) % 7) &&
                            hour <= new Date().getHours())));

                    return (
                      <div
                        key={dayIdx}
                        onClick={() => !slot && !isPast && setAddModal({ day: dayIdx, hour })}
                        className={`h-8 rounded-md text-xs flex items-center justify-center transition-all select-none ${
                          slot?.status === 'booked'
                            ? 'bg-[#1565C0] text-white font-semibold cursor-default'
                            : slot?.status === 'available'
                            ? 'bg-[#43A047] text-white font-semibold cursor-pointer group relative'
                            : isPast
                            ? 'bg-gray-100 cursor-not-allowed'
                            : 'bg-white border border-dashed border-gray-300 cursor-pointer hover:border-[#43A047] hover:bg-[#F0FDF4]'
                        }`}
                      >
                        {slot?.status === 'booked' && (
                          <span className="truncate px-1 text-[10px]">{slot.studentName?.split(' ')[0]}</span>
                        )}
                        {slot?.status === 'available' && (
                          <span className="text-[10px] hidden group-hover:flex items-center gap-1">
                            <Trash2 size={10} onClick={(e) => { e.stopPropagation(); removeSlot(slot.id); }} />
                          </span>
                        )}
                        {!slot && !isPast && (
                          <Plus size={12} className="text-gray-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Available Slots List */}
      <div className="card px-5 py-5">
        <h3 className="font-bold text-gray-900 mb-3">Available Slots This Week</h3>
        {availableCount === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No available slots added yet. Click any cell above to add one.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots
              .filter((s) => s.status === 'available')
              .sort((a, b) => a.day - b.day || a.hour - b.hour)
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  <span>{DAYS[s.day]}, {fmt12(s.hour)}</span>
                  <button
                    onClick={() => removeSlot(s.id)}
                    className="hover:text-red-500 transition-colors"
                    title="Remove slot"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Slot Confirm Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">Add Availability Slot</h3>
            <p className="text-sm text-gray-600">
              Add a slot on <strong>{DAYS[addModal.day]}</strong> at{' '}
              <strong>{fmt12(addModal.hour)}</strong>? Students will be able to book this time.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAddModal(null)}
                className="flex-1 border border-gray-300 text-gray-600 text-sm font-semibold py-2.5 rounded-full hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => addSlot(addModal.day, addModal.hour)}
                className="flex-1 bg-[#43A047] hover:bg-[#2E7D32] text-white text-sm font-bold py-2.5 rounded-full transition-colors"
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
