import React from 'react';
import { TemperatureUnit, WindSpeedUnit } from '../types/weather';
import { CloudLightning, RefreshCw } from 'lucide-react';

interface NavbarProps {
  tempUnit: TemperatureUnit;
  onToggleTempUnit: () => void;
  windUnit: WindSpeedUnit;
  onToggleWindUnit: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  tempUnit,
  onToggleTempUnit,
  windUnit,
  onToggleWindUnit,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <a
            href="#"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-sky-400 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <CloudLightning className="w-4 h-4" />
            </div>
            <span>Atmosphere</span>
          </a>

          {/* Zone 2: 4-5 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a
              href="#overview"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Current Conditions
            </a>
            <a
              href="#trend"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Hourly Trends
            </a>
            <a
              href="#forecast"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              7-Day Outlook
            </a>
            <a
              href="#intelligence"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Smart Planning
            </a>
          </nav>

          {/* Zone 3: Primary action & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh current meteorological readings"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`}
              />
            </button>

            {/* Wind Unit Toggle */}
            <button
              onClick={onToggleWindUnit}
              title="Toggle Wind Speed Unit"
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white whitespace-nowrap shrink-0 transition-colors"
            >
              {windUnit.toUpperCase()}
            </button>

            {/* Temperature Unit Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
              <button
                onClick={onToggleTempUnit}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 font-mono ${
                  tempUnit === 'celsius'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                °C
              </button>
              <button
                onClick={onToggleTempUnit}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 font-mono ${
                  tempUnit === 'fahrenheit'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
