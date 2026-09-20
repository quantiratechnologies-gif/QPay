import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import type { CountryCode } from 'libphonenumber-js';

export interface CountryItem {
  code: CountryCode;
  dialCode: string;
  name: string;
  nameAr: string;
  flag: string;
}

export const COUNTRIES: CountryItem[] = [
  { code: 'SA', dialCode: '+966', name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', flag: '🇸🇦' },
  { code: 'AE', dialCode: '+971', name: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', flag: '🇦🇪' },
  { code: 'IN', dialCode: '+91',  name: 'India', nameAr: 'الهند', flag: '🇮🇳' },
  { code: 'QA', dialCode: '+974', name: 'Qatar', nameAr: 'قطر', flag: '🇶🇦' },
  { code: 'KW', dialCode: '+965', name: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼' },
  { code: 'BH', dialCode: '+973', name: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭' },
  { code: 'OM', dialCode: '+968', name: 'Oman', nameAr: 'عمان', flag: '🇴🇲' },
  { code: 'EG', dialCode: '+20',  name: 'Egypt', nameAr: 'مصر', flag: '🇪🇬' },
  { code: 'JO', dialCode: '+962', name: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴' },
  { code: 'US', dialCode: '+1',   name: 'United States', nameAr: 'الولايات المتحدة', flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44',  name: 'United Kingdom', nameAr: 'المملكة المتحدة', flag: '🇬🇧' },
];

interface CountryCodePickerProps {
  selectedCountry: CountryItem;
  onSelect: (country: CountryItem) => void;
  isRtl?: boolean;
}

export const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
  selectedCountry,
  onSelect,
  isRtl = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = COUNTRIES.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.nameAr.includes(q) ||
      c.dialCode.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          padding: '10px 12px',
          color: '#FFFFFF',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s',
          height: '48px',
          boxSizing: 'border-box',
        }}
      >
        <span style={{ fontSize: '18px' }}>{selectedCountry.flag}</span>
        <span>{selectedCountry.dialCode}</span>
        <ChevronDown size={14} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Dropdown Modal/Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: isRtl ? 'auto' : 0,
            right: isRtl ? 0 : 'auto',
            width: '280px',
            maxHeight: '340px',
            backgroundColor: '#161922',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search Header */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '6px 10px',
              }}
            >
              <Search size={14} style={{ opacity: 0.6 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isRtl ? 'ابحث عن بلد أو رمز...' : 'Search country or code...'}
                autoFocus
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* List of Countries */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '4px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
                {isRtl ? 'لا توجد نتائج' : 'No countries found'}
              </div>
            ) : (
              filtered.map((country) => {
                const isSelected = country.code === selectedCountry.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => {
                      onSelect(country);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '10px 12px',
                      background: isSelected ? 'rgba(74, 222, 128, 0.12)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: isSelected ? '#4ADE80' : '#FFFFFF',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: isRtl ? 'right' : 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{country.flag}</span>
                      <span style={{ fontWeight: 500 }}>
                        {isRtl ? country.nameAr : country.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ opacity: 0.7, fontSize: '12px', fontFamily: 'monospace' }}>
                        {country.dialCode}
                      </span>
                      {isSelected && <Check size={14} color="#4ADE80" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
