import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { isAxiosError } from 'axios';
import {
  getTutorSlots,
  searchTutors,
  type AvailabilitySlot,
  type TutorProfile,
} from '../../core/network/tutorsApi';
import { createBooking } from '../../core/network/bookingsApi';
import ViewScheduleModal from './ViewScheduleModal';

const FILTER_CHIPS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Business', 'Conversation'];
const CALENDAR_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function buildMonthGrid(monthDate: Date): Date[] {
  const first = startOfMonth(monthDate);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export default function BookSessionPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [timeFilter, setTimeFilter] = useState('All');
  const [activeChip, setActiveChip] = useState('All');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [scheduleModal, setScheduleModal] = useState<{
    tutorName: string;
    tutorId: string;
    languages: string[];
  } | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<{ tutor: string; slot: string; date: string } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const monthGrid = buildMonthGrid(currentMonth);

  useEffect(() => {
    if (scheduleModal) {
      void loadSlots(scheduleModal.tutorId);
    }
  }, [selectedDate]);

  useEffect(() => {
    searchTutors({}).then((res) => setTutors(res.items)).catch(() => {});
  }, []);

  const TIME_OPTIONS = ['All', 'Morning (6AM–12PM)', 'Afternoon (12PM–5PM)', 'Evening (5PM–9PM)'];

  const handleBook = async (slot: AvailabilitySlot) => {
    if (!scheduleModal || bookingInProgress) return;
    setBookingError(null);
    setBookingInProgress(true);
    try {
      const created = await createBooking({
        slotId: slot.id,
        tutorId: scheduleModal.tutorId,
        language: scheduleModal.languages[0] ?? 'English',
      });
      const start = new Date(created.slot.startTime);
      setConfirmedBooking({
        tutor: scheduleModal.tutorName,
        slot: start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        date: toDisplayDate(selectedDate),
      });
      setScheduleModal(null);
      setSlots([]);
      if (created.status === 'pending') {
        navigate(`/checkout/${created.id}`);
      }
    } catch (err) {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (isAxiosError(err) && err.response?.status === 409) {
        setBookingError('This slot was just booked by someone else. Please pick another available slot.');
        try {
          const refreshed = await getTutorSlots(scheduleModal.tutorId, timezone);
          setSlots(refreshed.filter((nextSlot) => isSameDay(new Date(nextSlot.startTime), selectedDate)));
        } catch {
          setSlots([]);
        }
      } else if (isAxiosError(err) && err.response?.status === 429) {
        setBookingError('Too many requests. Please wait a few seconds and try again.');
      } else {
        setBookingError('Unable to create booking for this slot. Please try another slot.');
      }
    } finally {
      setBookingInProgress(false);
    }
  };

  const loadSlots = async (tutorId: string) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      const all = await getTutorSlots(tutorId, timezone);
      const filtered = all.filter((slot) => {
        const date = new Date(slot.startTime);
        return isSameDay(date, selectedDate);
      });
      setSlots(filtered);
    } catch {
      setSlots([]);
    }
  };

  return (
    <div className="max-w-4xl space-y-5">
      {/* Date Picker Row */}
      <div className="card px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Select Date</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <ChevronLeft size={16} />
            </button>
            <p className="text-sm font-bold text-gray-800 min-w-[130px] text-center">
              {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
            <button
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {CALENDAR_DAYS.map((day) => (
            <div key={day} className="text-[11px] text-gray-400 text-center font-semibold py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthGrid.map((day) => {
            const inMonth = day.getMonth() === currentMonth.getMonth();
            const selected = isSameDay(day, selectedDate);
            const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
            const inPast = dayStart < todayStart;
            return (
              <button
                key={day.toISOString()}
                disabled={inPast}
                onClick={() => setSelectedDate(new Date(day.getFullYear(), day.getMonth(), day.getDate()))}
                className={`h-10 rounded-lg text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-[#43A047] text-white'
                    : inMonth
                      ? 'text-gray-700 hover:bg-[#E8F5E9]'
                      : 'text-gray-300 hover:bg-gray-50'
                } ${inPast ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3">Selected: {toDisplayDate(selectedDate)}</p>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Time filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="flex items-center gap-1.5 px-4 py-2 border-2 border-[#EEEEEE] rounded-full text-sm font-medium text-gray-700 hover:border-[#43A047] bg-white"
          >
            <span>⏰</span> {timeFilter} <ChevronDown size={14} />
          </button>
          {showTimeDropdown && (
            <div className="absolute top-full mt-1 left-0 bg-white rounded-xl shadow-lg border border-[#EEEEEE] z-10 min-w-[180px]">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setTimeFilter(opt); setShowTimeDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#E8F5E9] transition-colors first:rounded-t-xl last:rounded-b-xl ${
                    timeFilter === opt ? 'font-semibold text-[#43A047]' : 'text-gray-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter chips */}
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveChip(chip)}
            className={`filter-chip ${activeChip === chip ? 'filter-chip-active' : ''}`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Confirmed Booking Alert */}
      {confirmedBooking && (
        <div className="bg-[#BBF7D0] border border-[#14783D] text-[#14783D] rounded-xl px-5 py-3 flex items-center gap-2">
          <span className="text-lg">✓</span>
          <div>
            <p className="font-semibold text-sm">Session Booked!</p>
            <p className="text-xs">{confirmedBooking.tutor} · {confirmedBooking.date} at {confirmedBooking.slot}</p>
          </div>
          <button className="ml-auto text-[#14783D] hover:text-[#0d5c2d]" onClick={() => setConfirmedBooking(null)}>
            ×
          </button>
        </div>
      )}

      {bookingError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 text-sm">
          {bookingError}
        </div>
      )}

      <div className="space-y-4">
        {tutors.map((tutor) => {
          const displayName = tutor.user.profile?.displayName ?? 'Tutor';
          return (
          <div key={tutor.id} className="card px-5 py-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#43A047] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900">{displayName}</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {tutor.languagesTaught.slice(0, 3).map((s) => (
                  <span key={s} className="text-[11px] px-2 py-0.5 bg-[#E8F5E9] text-[#43A047] rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">₹{(tutor.hourlyRateCents / 100).toFixed(0)}/hr</p>
            </div>
            <button
              onClick={() => {
                setScheduleModal({
                  tutorName: displayName,
                  tutorId: tutor.userId,
                  languages: tutor.languagesTaught,
                });
                void loadSlots(tutor.userId);
              }}
              className="btn-primary flex-shrink-0"
            >
              View Schedule
            </button>
          </div>
          );
        })}
      </div>

      {scheduleModal && (
        <ViewScheduleModal
          tutorName={scheduleModal.tutorName}
          selectedDate={toDisplayDate(selectedDate)}
          slots={slots}
          bookingInProgress={bookingInProgress}
          onClose={() => setScheduleModal(null)}
          onBook={handleBook}
        />
      )}
    </div>
  );
}
