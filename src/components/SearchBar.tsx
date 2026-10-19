import React, { useState, useEffect, useRef } from 'react';
import { GeoLocationResult } from '../types/weather';
import { searchCities, POPULAR_CITIES } from '../services/openMeteoApi';
import { Search, MapPin, Loader2, X, Navigation, History } from 'lucide-react';

interface SearchBarProps {
  onSelectCity: (city: GeoLocationResult) => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  selectedCityName?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectCity,
  onUseCurrentLocation,
  isLocating,
  selectedCityName,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<GeoLocationResult[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('atmosphere_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save city to recents
  const saveToRecents = (city: GeoLocationResult) => {
    try {
      const updated = [city, ...recentSearches.filter(c => c.id !== city.id)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('atmosphere_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setSearchError(null);
      return;
    }

    const abortController = new AbortController();
    setIsLoading(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const found = await searchCities(query, abortController.signal);
        setResults(found);
        setIsOpen(true);
        if (found.length === 0) {
          setSearchError(`No cities matching "${query}". Check spelling or try a larger neighboring city.`);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setSearchError('Unable to reach geocoding service. Please check your network connection.');
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city: GeoLocationResult) => {
    saveToRecents(city);
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
    setResults([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full space-y-3" ref={dropdownRef}>
      {/* Search Input Box */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-400 transition-colors">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search any global city or region (e.g. Kyoto, Vancouver, Zurich)..."
            className="w-full pl-10 pr-10 py-3 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 focus:border-sky-500 rounded-xl text-sm text-white placeholder-slate-400 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-sans"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setSearchError(null);
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Locate Me Button */}
        <button
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          title="Detect my current location via GPS"
          className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs font-medium text-slate-200 hover:text-white whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          ) : (
            <Navigation className="w-4 h-4 text-sky-400" />
          )}
          <span className="hidden sm:inline">Locate Me</span>
        </button>
      </div>

      {/* Popular Cities Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
          Popular:
        </span>
        {POPULAR_CITIES.map(city => {
          const isCurrent = selectedCityName === city.name;
          return (
            <button
              key={city.id}
              onClick={() => handleSelect(city)}
              className={`px-3 py-1 rounded-lg border text-xs whitespace-nowrap transition-all duration-150 shrink-0 ${
                isCurrent
                  ? 'bg-sky-950/80 text-sky-300 border-sky-800/80 font-medium'
                  : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {city.name}
              <span className="text-slate-500 ml-1 text-[11px]">{city.country_code}</span>
            </button>
          );
        })}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto backdrop-blur-xl">
            {isLoading && results.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Searching global meteorological coordinates...</span>
              </div>
            )}

            {searchError && (
              <div className="p-4 text-center text-xs text-amber-300/90 bg-amber-950/20">
                {searchError}
              </div>
            )}

            {results.length > 0 && (
              <div className="divide-y divide-slate-800/80">
                <div className="px-3 py-2 bg-slate-950/60 text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Geocoding Results ({results.length})</span>
                  <span>Use ↑↓ and Enter</span>
                </div>
                {results.map((city, idx) => {
                  const isHighlighted = selectedIndex === idx;
                  return (
                    <button
                      key={city.id}
                      onClick={() => handleSelect(city)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors ${
                        isHighlighted
                          ? 'bg-sky-950/50 text-white'
                          : 'hover:bg-slate-800/70 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {city.name}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            {city.admin1 && <span>{city.admin1}</span>}
                            {city.admin1 && city.country && <span>·</span>}
                            {city.country && <span>{city.country}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-[11px] font-mono text-slate-400 shrink-0 tabular-nums">
                        <div>
                          {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                        </div>
                        {city.country_code && (
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">
                            {city.country_code}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* If query is empty and we have recent searches */}
            {!query && recentSearches.length > 0 && (
              <div className="divide-y divide-slate-800/80">
                <div className="px-3 py-2 bg-slate-950/60 text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  <span>Recent Destinations</span>
                </div>
                {recentSearches.map(city => (
                  <button
                    key={`recent-${city.id}`}
                    onClick={() => handleSelect(city)}
                    className="w-full px-4 py-2.5 text-left flex items-center justify-between gap-3 hover:bg-slate-800/70 text-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-xs font-medium text-white">{city.name}</span>
                      <span className="text-xs text-slate-400">· {city.country}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {city.country_code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
