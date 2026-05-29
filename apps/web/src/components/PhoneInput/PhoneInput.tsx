import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

// Common country codes with their dial codes
const COUNTRIES = [
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'RU', name: 'Russia', dial: '+7', flag: '🇷🇺' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
  { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dial: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', dial: '+51', flag: '🇵🇪' },
  { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪' },
  { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dial: '+358', flag: '🇫🇮' },
  { code: 'GR', name: 'Greece', dial: '+30', flag: '🇬🇷' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
  { code: 'TR', name: 'Turkey', dial: '+90', flag: '🇹🇷' },
  { code: 'IL', name: 'Israel', dial: '+972', flag: '🇮🇱' },
  { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (countryName: string) => void;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
}

export default function PhoneInput({
  value,
  onChange,
  onCountryChange,
  placeholder = 'Phone Number',
  className = '',
  autoComplete = 'tel',
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSelectedCountry, setUserSelectedCountry] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect country from timezone only (privacy-friendly, no geolocation)
  useEffect(() => {
    const detectCountry = () => {
      try {
        // Only apply auto-detection if user hasn't manually selected a country
        if (userSelectedCountry) return;

        // Use timezone to detect country (privacy-friendly, no precise location)
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        fallbackToTimezone(timezone);
      } catch (error) {
        console.error('Country detection error:', error);
      }
    };

    const fallbackToTimezone = (timezone: string) => {
      // Map common timezones to countries
      const timezoneMap: Record<string, string> = {
        'America/New_York': 'US',
        'America/Chicago': 'US',
        'America/Los_Angeles': 'US',
        'America/Denver': 'US',
        'Europe/London': 'GB',
        'Europe/Paris': 'FR',
        'Europe/Berlin': 'DE',
        'Asia/Kolkata': 'IN',
        'Asia/Shanghai': 'CN',
        'Asia/Tokyo': 'JP',
        'Australia/Sydney': 'AU',
        'America/Toronto': 'CA',
      };

      const detectedCode = timezoneMap[timezone];
      if (detectedCode) {
        const country = COUNTRIES.find((c) => c.code === detectedCode);
        if (country) {
          setSelectedCountry(country);
        }
      }
    };

    detectCountry();
  }, [userSelectedCountry]);

  // Parse existing value if provided
  useEffect(() => {
    if (value && value.startsWith('+')) {
      // Find matching country code
      const matchingCountry = COUNTRIES.find((c) => value.startsWith(c.dial));
      if (matchingCountry) {
        setSelectedCountry(matchingCountry);
        setPhoneNumber(value.slice(matchingCountry.dial.length));
      }
    }
  }, []);

  // Update parent when values change
  useEffect(() => {
    const fullNumber = phoneNumber ? `${selectedCountry.dial}${phoneNumber}` : '';
    onChange(fullNumber);
    onCountryChange?.(selectedCountry.name);
  }, [selectedCountry, phoneNumber, onChange, onCountryChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dial.includes(searchQuery) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-1">
        {/* Country code dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="h-full px-3 py-3 border border-gray-300 rounded-l-xl bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#43A047] flex items-center gap-2 min-w-[100px]"
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selectedCountry.dial}</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-hidden flex flex-col">
              {/* Search */}
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43A047]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Country list */}
              <div className="overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(country);
                      setUserSelectedCountry(true);
                      setDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm"
                  >
                    <span className="text-xl">{country.flag}</span>
                    <span className="flex-1 font-medium text-gray-900">{country.name}</span>
                    <span className="text-gray-500">{country.dial}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone number input */}
        <input
          type="tel"
          placeholder={placeholder}
          value={phoneNumber}
          onChange={(e) => {
            // Only allow digits
            const cleaned = e.target.value.replace(/\D/g, '');
            setPhoneNumber(cleaned);
          }}
          className="flex-1 border border-gray-300 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
          autoComplete={autoComplete}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 ml-1">
        E.164 format: {selectedCountry.dial} + your number
      </p>
    </div>
  );
}
