import React from 'react';
import {
  ProcessedWeatherData,
  TemperatureUnit,
  WindSpeedUnit,
} from '../types/weather';
import { formatTemp, formatWind } from '../services/openMeteoApi';
import { getWeatherCondition } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import {
  Compass,
  Droplets,
  Wind,
  Sun,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface CurrentWeatherCardProps {
  weather: ProcessedWeatherData;
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  tempUnit,
  windUnit,
}) => {
  const { current, location, daily } = weather;
  const condition = getWeatherCondition(current.weatherCode);
  const today = daily[0];

  // Wind direction compass cardinal
  const getCardinalDirection = (deg: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(deg / 22.5) % 16;
    return directions[index];
  };

  const windCardinal = getCardinalDirection(current.windDirection);

  // UV description
  const getUVBadge = (uv: number) => {
    if (uv >= 11) return { label: 'Extreme', color: 'text-purple-400' };
    if (uv >= 8) return { label: 'Very High', color: 'text-rose-400' };
    if (uv >= 6) return { label: 'High', color: 'text-amber-400' };
    if (uv >= 3) return { label: 'Moderate', color: 'text-yellow-400' };
    return { label: 'Low', color: 'text-emerald-400' };
  };

  const uvInfo = getUVBadge(current.uvIndex);

  // Humidity status
  const getHumidityStatus = (h: number) => {
    if (h > 70) return 'Humid';
    if (h < 30) return 'Dry';
    return 'Comfortable';
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl transition-all duration-300">
      {/* Ambient Weather Glow Backdrop */}
      <div
        className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none bg-gradient-to-br ${condition.gradient}`}
      />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${condition.accentColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 p-6 sm:p-8 space-y-8">
        {/* Top Location Bar & Timestamp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-start gap-3">
            <div
              className="p-3 rounded-2xl shrink-0 mt-0.5"
              style={{
                backgroundColor: `${condition.accentColor}18`,
                color: condition.accentColor,
              }}
            >
              <WeatherIcon
                code={current.weatherCode}
                isDay={current.isDay}
                className="w-7 h-7"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {location.name}
                </h2>
                {location.country_code && (
                  <span className="text-xs font-mono uppercase text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
                    {location.country_code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                {location.admin1 && <span>{location.admin1}</span>}
                {location.admin1 && location.country && <span>·</span>}
                {location.country && <span>{location.country}</span>}
                <span>·</span>
                <span className="font-mono tabular-nums text-slate-500">
                  {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Observed {weather.lastUpdated}</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">
              Timezone: {weather.timezone}
            </span>
          </div>
        </div>

        {/* Center: Main Temperature & Condition Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Temp Block */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex items-baseline gap-4">
              <span className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white font-mono tabular-nums">
                {formatTemp(current.temperature, tempUnit)}
              </span>
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-semibold text-slate-200 block">
                  {condition.label}
                </span>
                <span className="text-xs text-slate-400 font-mono tabular-nums block">
                  Feels like {formatTemp(current.feelsLike, tempUnit)}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-md leading-relaxed">
              {condition.description}
            </p>

            {/* Today's High / Low bar */}
            {today && (
              <div className="flex items-center gap-4 text-xs font-mono mt-4 pt-4 border-t border-slate-800/60 max-w-sm">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>High:</span>
                  <span className="font-semibold text-white">
                    {formatTemp(today.tempMax, tempUnit)}
                  </span>
                </div>
                <span className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <TrendingDown className="w-3.5 h-3.5 text-sky-400" />
                  <span>Low:</span>
                  <span className="font-semibold text-white">
                    {formatTemp(today.tempMin, tempUnit)}
                  </span>
                </div>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">
                  {current.isDay ? 'Daytime' : 'Nighttime'}
                </span>
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Wind with Interactive Direction Compass */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-emerald-400" />
                  Wind
                </span>
                <span className="font-mono text-[11px] font-semibold text-emerald-300">
                  {windCardinal}
                </span>
              </div>
              <div className="my-2">
                <span className="text-lg font-bold text-white font-mono tabular-nums">
                  {formatWind(current.windSpeed, windUnit)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Compass
                  className="w-3.5 h-3.5 text-slate-500 transition-transform duration-500"
                  style={{ transform: `rotate(${current.windDirection}deg)` }}
                />
                <span className="font-mono tabular-nums">{current.windDirection}° heading</span>
              </div>
            </div>

            {/* Humidity */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  Humidity
                </span>
                <span className="text-[11px] text-sky-300">
                  {getHumidityStatus(current.humidity)}
                </span>
              </div>
              <div className="my-2">
                <span className="text-lg font-bold text-white font-mono tabular-nums">
                  {current.humidity}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-sky-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, current.humidity)}%` }}
                />
              </div>
            </div>

            {/* UV Index */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  UV Index
                </span>
                <span className={`text-[11px] font-semibold ${uvInfo.color}`}>
                  {uvInfo.label}
                </span>
              </div>
              <div className="my-2">
                <span className="text-lg font-bold text-white font-mono tabular-nums">
                  {current.uvIndex.toFixed(1)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {current.uvIndex >= 3 ? 'Sun protection advised' : 'Minimal solar risk'}
              </div>
            </div>

            {/* Precipitation Rate */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" />
                  Precipitation
                </span>
                <span className="font-mono text-[11px] text-blue-300">Rate</span>
              </div>
              <div className="my-2">
                <span className="text-lg font-bold text-white font-mono tabular-nums">
                  {current.precipitation.toFixed(1)} <span className="text-xs font-normal">mm</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {today ? `${today.precipitationProbability}% chance today` : 'Real-time sensor'}
              </div>
            </div>

            {/* Atmospheric Pressure */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-teal-400" />
                  Barometer
                </span>
                <span className="text-[11px] text-teal-300 font-mono">MSL</span>
              </div>
              <div className="my-2">
                <span className="text-lg font-bold text-white font-mono tabular-nums">
                  {Math.round(current.surfacePressure)}{' '}
                  <span className="text-xs font-normal">hPa</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {current.surfacePressure >= 1013 ? 'High pressure field' : 'Low pressure trough'}
              </div>
            </div>

            {/* Sunrise / Sunset */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="flex items-center gap-1.5">
                  <Sunrise className="w-3.5 h-3.5 text-amber-400" />
                  Solar Arc
                </span>
                <Sunset className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="my-1.5 space-y-0.5">
                <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-slate-400">Rise:</span>
                  <span className="text-slate-200 font-medium">
                    {today?.sunrise
                      ? new Date(today.sunrise).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : '06:30 AM'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                  <span className="text-slate-400">Set:</span>
                  <span className="text-slate-200 font-medium">
                    {today?.sunset
                      ? new Date(today.sunset).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : '06:15 PM'}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Elev: {weather.elevation}m ASL
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
