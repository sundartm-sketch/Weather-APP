import React, { useState } from 'react';
import { DailyPoint, TemperatureUnit, WindSpeedUnit } from '../types/weather';
import { formatTemp, formatWind } from '../services/openMeteoApi';
import { getWeatherCondition } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import {
  Calendar,
  Droplets,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface DailyForecastViewProps {
  daily: DailyPoint[];
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
}

export const DailyForecastView: React.FC<DailyForecastViewProps> = ({
  daily,
  tempUnit,
  windUnit,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Overall min and max across all 7 days to scale temperature range bars
  const weekMin = Math.min(...daily.map(d => d.tempMin));
  const weekMax = Math.max(...daily.map(d => d.tempMax));
  const weekSpan = Math.max(1, weekMax - weekMin);

  const selectedDay = daily[selectedDayIndex] || daily[0];
  const selectedCondition = getWeatherCondition(selectedDay.weatherCode);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              Synoptic Outlook
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs text-sky-400 font-mono tabular-nums">7 Days</span>
          </div>
          <h3 className="text-lg font-semibold text-white mt-1">
            Weekly Meteorological Forecast
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Select any day to inspect detailed diurnal conditions and trip advisory.
        </p>
      </div>

      {/* 7-Day Interactive Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {daily.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const condition = getWeatherCondition(day.weatherCode);

          // Calculate temperature bar left offset and width
          const leftPercent = ((day.tempMin - weekMin) / weekSpan) * 100;
          const widthPercent = Math.max(12, ((day.tempMax - day.tempMin) / weekSpan) * 100);

          return (
            <button
              key={day.date}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/40'
                  : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              {/* Day title */}
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold tracking-tight ${
                      isSelected ? 'text-white' : 'text-slate-200'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  {idx === 0 && (
                    <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold">
                      Now
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {day.formattedDate}
                </span>
              </div>

              {/* Weather Icon & Label */}
              <div className="my-3 flex flex-col items-center justify-center text-center">
                <div
                  className="p-2 rounded-xl mb-1.5 transition-transform duration-200 group-hover:scale-105"
                  style={{
                    backgroundColor: `${condition.accentColor}18`,
                    color: condition.accentColor,
                  }}
                >
                  <WeatherIcon code={day.weatherCode} className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-slate-300 font-medium truncate max-w-[95px]">
                  {condition.label}
                </span>
              </div>

              {/* Min/Max and Temperature Range Bar */}
              <div className="w-full space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-white font-semibold">
                    {formatTemp(day.tempMax, tempUnit)}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {formatTemp(day.tempMin, tempUnit)}
                  </span>
                </div>

                {/* Visual bar relative to week min/max */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden relative">
                  <div
                    className="absolute top-0 bottom-0 rounded-full transition-all duration-300"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      background: `linear-gradient(90deg, #38bdf8, #f59e0b)`,
                    }}
                  />
                </div>

                {/* Rain probability */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1 text-blue-400">
                    <Droplets className="w-2.5 h-2.5" />
                    {day.precipitationProbability}%
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Wind className="w-2.5 h-2.5" />
                    {Math.round(day.windSpeedMax)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Deep Dive Panel */}
      <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Day overview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <h4 className="text-base font-semibold text-white">
                Detailed Outlook for {selectedDay.dayName} ({selectedDay.formattedDate})
              </h4>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {selectedCondition.description}{' '}
              {selectedDay.precipitationProbability > 40
                ? 'Precipitation is likely during portions of the day; plan indoor alternatives or carry rain protection.'
                : 'Favorable atmospheric conditions with low risk of disruptive precipitation.'}
            </p>
          </div>

          {/* Quick Metrics Matrix for the selected day */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono tabular-nums shrink-0">
            {/* Sunrise / Sunset */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                Sunrise / Sunset
              </span>
              <span className="text-xs font-semibold text-slate-200 mt-1 block">
                {selectedDay.sunrise
                  ? new Date(selectedDay.sunrise).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })
                  : '06:30 AM'}{' '}
                /
                {' ' +
                  (selectedDay.sunset
                    ? new Date(selectedDay.sunset).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })
                    : '06:15 PM')}
              </span>
            </div>

            {/* Precipitation Accumulation */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                Precipitation
              </span>
              <span className="text-xs font-semibold text-slate-200 mt-1 block">
                {selectedDay.precipitationSum.toFixed(1)} mm ({selectedDay.precipitationProbability}%)
              </span>
            </div>

            {/* UV Index Max */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                UV Radiation Peak
              </span>
              <span className="text-xs font-semibold text-slate-200 mt-1 block">
                {selectedDay.uvIndexMax.toFixed(1)} UV ({selectedDay.uvIndexMax >= 6 ? 'High' : selectedDay.uvIndexMax >= 3 ? 'Moderate' : 'Low'})
              </span>
            </div>

            {/* Wind Max */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
                Peak Gusts
              </span>
              <span className="text-xs font-semibold text-slate-200 mt-1 block">
                {formatWind(selectedDay.windSpeedMax, windUnit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
