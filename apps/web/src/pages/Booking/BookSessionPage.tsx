import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { searchTutors, type TutorProfile } from '../../core/network/tutorsApi';
import ViewScheduleModal from './ViewScheduleModal';

const FILTER_CHIPS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Business', 'Conversation'];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates() {
  const today = new Date();
  return DAYS_OF_WEEK.map((day, i) => {
    const d = new Date(today);
    const diff = i - today.getDay() + 1;
    d.setDate(today.getDate() + diff);
    return { day, date: d.getDate(), full: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) };
  });
}

export default function BookSessionPage() {
  const weekDates = getWeekDates();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [timeFilter, setTimeFilter] = useState('All');
  const [activeChip, setActiveChip] = useState('All');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [scheduleModal, setScheduleModal] = useState<{ tutorName: string; tutorId: string } | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{ tutor: string; slot: string; date: string } | null>(null);

  useEffect(() => {
    searchTutors({}).then((res) => setTutors(res.items)).catch(() => {});
  }, []);

  const TIME_OPTIONS = ['All', 'Morning (6AM–12PM)', 'Afternoon (12PM–5PM)', 'Evening (5PM–9PM)'];

  const handleBook = (slot: string) => {
    if (!scheduleModal) return;
    setConfirmedBooking({
      tutor: scheduleModal.tutorName,
      slot,
      date: weekDates[selectedDayIdx].full,
    });
    setScheduleModal(null);
  };

  return (
    <div className="max-w-4xl space-y-5">
      {/* Date Picker Row */}
      <div className="card px-4 py-3">
        <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">Select Date</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {weekDates.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedDayIdx(i)}
              className={`flex flex-col items-center px-4 py-2.5 rounded-xl text-sm min-w-fit border-2 transition-all ${
                selectedDayIdx === i
                  ? 'bg-[#43A047] border-[#43A047] text-white'
                  : 'bg-white border-[#EEEEEE] text-gray-700 hover:border-[#43A047]'
              }`}
            >
              <span className="font-medium">{d.day}</span>
              <span className={`text-lg font-extrabold ${selectedDayIdx === i ? 'text-white' : 'text-gray-900'}`}>
                {d.date}
              </span>
            </button>
          ))}
        </div>
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
              onClick={() => setScheduleModal({ tutorName: displayName, tutorId: tutor.userId })}
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
          selectedDate={weekDates[selectedDayIdx].full}
          onClose={() => setScheduleModal(null)}
          onBook={handleBook}
        />
      )}
    </div>
  );
}
