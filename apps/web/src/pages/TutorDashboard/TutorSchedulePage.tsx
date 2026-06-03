import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import { getMyBookings, type Booking } from '../../core/network/bookingsApi';
import {
  createSlot,
  createBulkSlots,
  deleteMySlot,
  getMySlots,
  type AvailabilitySlot,
} from '../../core/network/tutorsApi';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HALF_HOURS = Array.from({ length: 48 }, (_, index) => index);

function formatHalfHour(index: number): string {
  const hour = Math.floor(index / 2);
  const mins = index % 2 === 0 ? '00' : '30';
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${mins} ${suffix}`;
}

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function TutorSchedulePage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const lastClickRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const load = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    getMySlots(timezone).then(setSlots).catch(() => {});
    getMyBookings().then(setBookings).catch(() => {});
  };

  const refreshSlots = useCallback(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return getMySlots(timezone).then(setSlots).catch(() => {});
  }, []);

  const toApiErrorMessage = (err: unknown): string => {
    if (!isAxiosError(err)) return 'Something went wrong. Please try again.';

    const status = err.response?.status;
    if (status === 409) {
      return 'This slot already exists or overlaps with another slot. The schedule was refreshed.';
    }
    if (status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    return 'Unable to update schedule right now. Please try again.';
  };

  useEffect(() => {
    load();
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const slotMap = useMemo(() => {
    const map = new Map<string, AvailabilitySlot>();
    for (const slot of slots) {
      const start = new Date(slot.startTime);
      const dayIndex = (start.getDay() + 6) % 7;
      const key = `${start.toDateString()}-${dayIndex}-${start.getHours() * 2 + (start.getMinutes() >= 30 ? 1 : 0)}`;
      map.set(key, slot);
    }
    return map;
  }, [slots]);

  const availableCount = slots.filter((s) => s.status === 'available').length;
  const bookedCount = slots.filter((s) => s.status === 'booked').length;

  const createAt = async (date: Date, halfHourIndex: number) => {
    const key = `${date.toDateString()}-${halfHourIndex}`;
    if (busyKey) return;
    setErrorMessage(null);
    setBusyKey(key);
    const start = new Date(date);
    start.setHours(Math.floor(halfHourIndex / 2), halfHourIndex % 2 === 0 ? 0 : 30, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);

    try {
      await createSlot({ startTime: start.toISOString(), endTime: end.toISOString() });
      await refreshSlots();
    } catch (err) {
      setErrorMessage(toApiErrorMessage(err));
      await refreshSlots();
    } finally {
      setBusyKey(null);
    }
  };

  const removeSlot = async (slotId: string) => {
    if (busyKey) return;
    setErrorMessage(null);
    setBusyKey(slotId);
    try {
      await deleteMySlot(slotId);
      await refreshSlots();
    } catch (err) {
      setErrorMessage(toApiErrorMessage(err));
      await refreshSlots();
    } finally {
      setBusyKey(null);
    }
  };

  const handleCellClick = useCallback(
    (date: Date, halfHourIndex: number, event: React.MouseEvent) => {
      const selectKey = `${date.toDateString()}-${halfHourIndex}`;
      const dayIndex = (date.getDay() + 6) % 7;
      const slotKey = `${date.toDateString()}-${dayIndex}-${halfHourIndex}`;
      const existingSlot = slotMap.get(slotKey);

      if (existingSlot || (!event.shiftKey && selectedSlots.size === 0)) {
        setSelectedSlots(new Set());
        lastClickRef.current = null;
        if (!existingSlot) {
          void createAt(date, halfHourIndex);
        }
        return;
      }

      if (event.shiftKey && lastClickRef.current) {
        const [lastDateStr, lastHourStr] = lastClickRef.current.split('-').slice(0, 2);
        const lastDate = new Date(lastDateStr);
        const lastHour = parseInt(lastHourStr, 10);

        const newSelected = new Set(selectedSlots);
        const current = new Date(date);
        current.setHours(Math.floor(halfHourIndex / 2), halfHourIndex % 2 === 0 ? 0 : 30, 0, 0);
        const last = new Date(lastDate);
        last.setHours(Math.floor(lastHour / 2), lastHour % 2 === 0 ? 0 : 30, 0, 0);

        const [startTime, endTime] = current <= last ? [current, last] : [last, current];

        const tempTime = new Date(startTime);
        while (tempTime <= endTime) {
          const rangeSelectKey = `${tempTime.toDateString()}-${tempTime.getHours() * 2 + (tempTime.getMinutes() >= 30 ? 1 : 0)}`;
          const rangeDayIndex = (tempTime.getDay() + 6) % 7;
          const rangeSlotKey = `${tempTime.toDateString()}-${rangeDayIndex}-${tempTime.getHours() * 2 + (tempTime.getMinutes() >= 30 ? 1 : 0)}`;
          if (!slotMap.get(rangeSlotKey)) {
            newSelected.add(rangeSelectKey);
          }
          tempTime.setMinutes(tempTime.getMinutes() + 30);
        }

        setSelectedSlots(newSelected);
      } else {
        setSelectedSlots(
          new Set(
            selectedSlots.has(selectKey)
              ? [...selectedSlots].filter((s) => s !== selectKey)
              : [...selectedSlots, selectKey],
          ),
        );
      }

      lastClickRef.current = selectKey;
    },
    [slotMap, selectedSlots],
  );

  const createSelectedSlots = useCallback(async () => {
    if (selectedSlots.size === 0 || busyKey) return;
    setErrorMessage(null);
    setBusyKey('bulk-creating');

    try {
      const slotsToCreate = Array.from(selectedSlots).map((selectKey) => {
        const [dateStr, halfHourStr] = selectKey.split('-');
        const date = new Date(dateStr);
        const halfHourIndex = parseInt(halfHourStr, 10);
        const start = new Date(date);
        start.setHours(Math.floor(halfHourIndex / 2), halfHourIndex % 2 === 0 ? 0 : 30, 0, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 30);
        return { startTime: start.toISOString(), endTime: end.toISOString() };
      });

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        try {
          await createBulkSlots(slotsToCreate);
          setSelectedSlots(new Set());
          lastClickRef.current = null;
          await refreshSlots();
        } catch (err) {
          setErrorMessage(toApiErrorMessage(err));
          await refreshSlots();
        } finally {
          setBusyKey(null);
        }
      }, 300);
    } catch {
      setBusyKey(null);
    }
  }, [selectedSlots, busyKey, refreshSlots]);

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Schedule & Availability</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            30-minute slots across 24 hours. Shift+Click to select multiple, or Click for single.
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
              {weekDates[6].toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {selectedSlots.size > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">{selectedSlots.size} slots selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedSlots(new Set());
                  lastClickRef.current = null;
                }}
                className="px-3 py-1.5 text-sm rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                disabled={busyKey === 'bulk-creating'}
                onClick={() => void createSelectedSlots()}
                className="px-3 py-1.5 text-sm rounded-lg bg-[#43A047] text-white font-medium hover:bg-[#2E7D32] disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                Create All
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-8 gap-1 mb-1">
              <div className="text-xs text-gray-400 font-semibold text-center py-2">Time</div>
              {DAYS.map((d, index) => (
                <div key={d} className="text-center">
                  <p className="text-xs font-bold text-gray-700">{d}</p>
                  <p className="text-xs mt-0.5 text-gray-400">{weekDates[index].getDate()}</p>
                </div>
              ))}
            </div>

            <div className="space-y-0.5 max-h-[520px] overflow-y-auto pr-1">
              {HALF_HOURS.map((halfHourIndex) => (
                <div key={halfHourIndex} className="grid grid-cols-8 gap-1 items-center">
                  <div className="text-xs text-gray-400 text-center py-1 font-medium">
                    {formatHalfHour(halfHourIndex)}
                  </div>
                  {weekDates.map((date, dayIndex) => {
                    const selectKey = `${date.toDateString()}-${halfHourIndex}`;
                    const slotKey = `${date.toDateString()}-${dayIndex}-${halfHourIndex}`;
                    const slot = slotMap.get(slotKey);
                    const isSelected = selectedSlots.has(selectKey);
                    const start = new Date(date);
                    start.setHours(Math.floor(halfHourIndex / 2), halfHourIndex % 2 === 0 ? 0 : 30, 0, 0);
                    const isPast = start.getTime() <= Date.now();

                    return (
                      <div
                        key={`${dayIndex}-${halfHourIndex}`}
                        onClick={(e) => handleCellClick(date, halfHourIndex, e)}
                        className={`h-7 rounded-md text-xs flex items-center justify-center transition-all select-none cursor-pointer ${
                          slot?.status === 'booked'
                            ? 'bg-[#1565C0] text-white font-semibold'
                            : slot?.status === 'available'
                              ? 'bg-[#43A047] text-white font-semibold group relative'
                              : isPast
                                ? 'bg-gray-100'
                                : isSelected
                                  ? 'bg-blue-100 border-2 border-blue-400'
                                  : 'bg-white border border-dashed border-gray-300 hover:border-[#43A047] hover:bg-[#F0FDF4]'
                        }`}
                      >
                        {slot?.status === 'available' && (
                          <button
                            disabled={busyKey === slot.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              void removeSlot(slot.id);
                            }}
                            className="hidden group-hover:flex items-center gap-1"
                            title="Remove slot"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                        {slot?.status === 'booked' && <span className="text-[10px]">Booked</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card px-5 py-5">
        <h3 className="font-bold text-gray-900 mb-3">Booking History</h3>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {bookings
              .filter((booking) => booking.slot)
              .sort(
                (a, b) =>
                  new Date(b.slot.startTime).getTime() - new Date(a.slot.startTime).getTime(),
              )
              .slice(0, 10)
              .map((booking) => {
                const start = new Date(booking.slot.startTime);
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-gray-800">{booking.language}</span>
                    <span className="text-gray-600">{start.toLocaleString('en-IN')}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
                      {booking.status}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
