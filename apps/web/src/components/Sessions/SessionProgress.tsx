import type { BookingStatus } from '../../core/network/bookingsApi';

const STEPS = ['Payment', 'Upcoming', 'In Session', 'Completed'] as const;

function getCurrentStep(status: BookingStatus): number {
  if (status === 'pending') return 0;
  if (status === 'confirmed') return 1;
  if (status === 'in_session') return 2;
  if (status === 'completed') return 3;
  return -1;
}

export default function SessionProgress({ status }: { status: BookingStatus }) {
  const currentStep = getCurrentStep(status);

  if (status === 'cancelled') {
    return (
      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
        <p className="text-xs font-semibold text-red-700">Session Cancelled</p>
      </div>
    );
  }

  return (
    <div className="mt-3" aria-label="Session progress">
      <div className="flex items-center gap-1">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step} className="flex items-center flex-1 min-w-0">
              <div
                className={`w-5 h-5 rounded-full border text-[10px] font-bold flex items-center justify-center ${
                  isCompleted
                    ? 'bg-[#43A047] border-[#43A047] text-white'
                    : isCurrent
                      ? 'bg-[#E8F5E9] border-[#43A047] text-[#2E7D32]'
                      : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`h-[2px] flex-1 mx-1 ${index < currentStep ? 'bg-[#43A047]' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex mt-1 gap-1">
        {STEPS.map((step) => (
          <p key={step} className="text-[10px] text-gray-500 flex-1 truncate">
            {step}
          </p>
        ))}
      </div>
    </div>
  );
}
