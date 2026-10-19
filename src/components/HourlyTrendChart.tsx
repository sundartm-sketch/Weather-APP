import React, { useState, useRef, useMemo } from 'react';
import { HourlyPoint, TemperatureUnit, WindSpeedUnit } from '../types/weather';
import { formatTemp, formatWind } from '../services/openMeteoApi';
import { getWeatherCondition } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';
import { Thermometer, CloudRain, Wind, Droplets, SunMedium } from 'lucide-react';

interface HourlyTrendChartProps {
  hourly: HourlyPoint[];
  tempUnit: TemperatureUnit;
  windUnit: WindSpeedUnit;
}

type ChartMetric = 'temperature' | 'precipitation' | 'wind' | 'humidity' | 'uv';

export const HourlyTrendChart: React.FC<HourlyTrendChartProps> = ({
  hourly,
  tempUnit,
  windUnit,
}) => {
  const [metric, setMetric] = useState<ChartMetric>('temperature');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Take first 24 hours for clean chart density
  const data = useMemo(() => hourly.slice(0, 24), [hourly]);

  // Extract values based on metric
  const metricConfig = useMemo(() => {
    switch (metric) {
      case 'temperature':
        return {
          label: 'Temperature',
          unit: tempUnit === 'celsius' ? '°C' : '°F',
          values: data.map(d =>
            tempUnit === 'fahrenheit' ? (d.temperature * 9) / 5 + 32 : d.temperature
          ),
          color: '#38bdf8', // sky-400
          gradientStart: 'rgba(56, 189, 248, 0.35)',
          gradientEnd: 'rgba(56, 189, 248, 0.0)',
          formatValue: (val: number) =>
            tempUnit === 'fahrenheit'
              ? `${Math.round(val)}°F`
              : `${Math.round(val)}°C`,
          icon: Thermometer,
        };
      case 'precipitation':
        return {
          label: 'Rain Probability',
          unit: '%',
          values: data.map(d => d.precipitationProbability),
          color: '#60a5fa', // blue-400
          gradientStart: 'rgba(96, 165, 250, 0.4)',
          gradientEnd: 'rgba(96, 165, 250, 0.0)',
          formatValue: (val: number) => `${Math.round(val)}%`,
          icon: CloudRain,
        };
      case 'wind':
        return {
          label: 'Wind Speed',
          unit: windUnit === 'mph' ? 'mph' : windUnit === 'ms' ? 'm/s' : 'km/h',
          values: data.map(d => {
            if (windUnit === 'mph') return d.windSpeed * 0.621371;
            if (windUnit === 'ms') return d.windSpeed / 3.6;
            return d.windSpeed;
          }),
          color: '#34d399', // emerald-400
          gradientStart: 'rgba(52, 211, 153, 0.35)',
          gradientEnd: 'rgba(52, 211, 153, 0.0)',
          formatValue: (val: number) => formatWind(val, windUnit),
          icon: Wind,
        };
      case 'humidity':
        return {
          label: 'Relative Humidity',
          unit: '%',
          values: data.map(d => d.humidity),
          color: '#818cf8', // indigo-400
          gradientStart: 'rgba(129, 140, 248, 0.35)',
          gradientEnd: 'rgba(129, 140, 248, 0.0)',
          formatValue: (val: number) => `${Math.round(val)}%`,
          icon: Droplets,
        };
      case 'uv':
        return {
          label: 'Solar UV Index',
          unit: 'UV',
          values: data.map(d => d.uvIndex),
          color: '#f59e0b', // amber-500
          gradientStart: 'rgba(245, 158, 11, 0.35)',
          gradientEnd: 'rgba(245, 158, 11, 0.0)',
          formatValue: (val: number) => `${val.toFixed(1)} UV`,
          icon: SunMedium,
        };
    }
  }, [metric, data, tempUnit, windUnit]);

  // Compute SVG dimensions & scaling
  const width = 800;
  const height = 220;
  const paddingX = 30;
  const paddingTop = 30;
  const paddingBottom = 45;

  const minVal = useMemo(() => {
    const rawMin = Math.min(...metricConfig.values);
    if (metric === 'precipitation' || metric === 'humidity') return 0;
    if (metric === 'uv') return 0;
    return Math.floor(rawMin - 2);
  }, [metricConfig.values, metric]);

  const maxVal = useMemo(() => {
    const rawMax = Math.max(...metricConfig.values);
    if (metric === 'precipitation') return Math.max(100, Math.ceil(rawMax / 10) * 10);
    if (metric === 'humidity') return 100;
    if (metric === 'uv') return Math.max(8, Math.ceil(rawMax));
    return Math.ceil(rawMax + 2);
  }, [metricConfig.values, metric]);

  const valueRange = maxVal - minVal || 1;

  // Generate points
  const points = useMemo(() => {
    return metricConfig.values.map((val, idx) => {
      const x = paddingX + (idx / (data.length - 1)) * (width - paddingX * 2);
      const normalizedY = (val - minVal) / valueRange;
      const y = height - paddingBottom - normalizedY * (height - paddingTop - paddingBottom);
      return { x, y, val, original: data[idx] };
    });
  }, [metricConfig.values, data, minVal, valueRange, width, height, paddingX, paddingTop, paddingBottom]);

  // Build smooth bezier path
  const { linePath, areaPath } = useMemo(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };

    let line = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      line += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const baselineY = height - paddingBottom;
    const area = `${line} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;

    return { linePath: line, areaPath: area };
  }, [points, height, paddingBottom]);

  // Pointer interaction
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const relativeX = (clientX / rect.width) * width;

    // Find closest point
    let closestIdx = 0;
    let closestDist = Infinity;
    points.forEach((p, idx) => {
      const dist = Math.abs(p.x - relativeX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    setActiveIndex(closestIdx);
  };

  const handlePointerLeave = () => {
    setActiveIndex(null);
  };

  // Currently inspected point or latest/mid point
  const currentHover = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
      {/* Top Header & Metric Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              Temporal Dynamics
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs text-sky-400 font-mono tabular-nums">24-Hour Horizon</span>
          </div>
          <h3 className="text-lg font-semibold text-white mt-1">
            Hourly Atmosphere Trend
          </h3>
        </div>

        {/* Metric Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {(
            [
              { id: 'temperature', label: 'Temperature', icon: Thermometer },
              { id: 'precipitation', label: 'Rain %', icon: CloudRain },
              { id: 'wind', label: 'Wind', icon: Wind },
              { id: 'humidity', label: 'Humidity', icon: Droplets },
              { id: 'uv', label: 'UV', icon: SunMedium },
            ] as const
          ).map(tab => {
            const Icon = tab.icon;
            const isActive = metric === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMetric(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
        <div className="flex flex-col">
          <span className="text-slate-400">Peak {metricConfig.label}</span>
          <span className="text-base font-semibold text-white font-mono tabular-nums mt-0.5">
            {metricConfig.formatValue(Math.max(...metricConfig.values))}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Minimum {metricConfig.label}</span>
          <span className="text-base font-semibold text-white font-mono tabular-nums mt-0.5">
            {metricConfig.formatValue(Math.min(...metricConfig.values))}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Condition at Peak</span>
          <span className="text-base font-medium text-slate-200 mt-0.5 truncate">
            {getWeatherCondition(
              data[
                metricConfig.values.indexOf(Math.max(...metricConfig.values))
              ]?.weatherCode || 0
            ).label}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400">Inspected Timestamp</span>
          <span className="text-base font-medium text-sky-400 font-mono tabular-nums mt-0.5">
            {currentHover ? currentHover.original.formattedTime : 'Hover to inspect'}
          </span>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair overflow-visible"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metricConfig.gradientStart} />
              <stop offset="100%" stopColor={metricConfig.gradientEnd} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = paddingTop + pct * (height - paddingTop - paddingBottom);
            const val = maxVal - pct * valueRange;
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#334155"
                  strokeOpacity="0.4"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Line curve */}
          <path
            d={linePath}
            fill="none"
            stroke={metricConfig.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Data point markers */}
          {points.map((p, idx) => {
            const isHovered = activeIndex === idx;
            // Show every 3rd dot unless hovered
            if (!isHovered && idx % 3 !== 0) return null;
            return (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5.5 : 3}
                fill={isHovered ? '#ffffff' : metricConfig.color}
                stroke="#0f172a"
                strokeWidth={isHovered ? 2.5 : 1.5}
                className="transition-all duration-150"
              />
            );
          })}

          {/* Hover scrubber vertical line */}
          {currentHover && (
            <g>
              <line
                x1={currentHover.x}
                y1={paddingTop - 10}
                x2={currentHover.x}
                y2={height - paddingBottom}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={currentHover.x}
                cy={currentHover.y}
                r="6"
                fill="#ffffff"
                stroke={metricConfig.color}
                strokeWidth="3"
              />
            </g>
          )}

          {/* X Axis Time Labels */}
          {points.map((p, idx) => {
            // Render label every 3 hours
            if (idx % 3 !== 0) return null;
            return (
              <g key={`label-${idx}`} transform={`translate(${p.x}, ${height - 18})`}>
                <text
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  className="tabular-nums"
                >
                  {p.original.formattedTime}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Card Tooltip */}
        {currentHover && (
          <div
            className="absolute pointer-events-none transition-all duration-75 z-20"
            style={{
              left: `${Math.min(
                Math.max(12, (currentHover.x / width) * 100),
                88
              )}%`,
              top: '12px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[170px] space-y-1.5">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                <span className="font-mono text-sky-400 font-semibold">
                  {currentHover.original.formattedTime}
                </span>
                <div className="flex items-center gap-1 text-slate-300">
                  <WeatherIcon
                    code={currentHover.original.weatherCode}
                    isDay={currentHover.original.isDay}
                    className="w-3.5 h-3.5 text-amber-400"
                  />
                  <span className="text-[11px] truncate max-w-[80px]">
                    {getWeatherCondition(currentHover.original.weatherCode).label}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{metricConfig.label}:</span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {metricConfig.formatValue(currentHover.val)}
                </span>
              </div>

              {metric !== 'temperature' && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Temp:</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {formatTemp(currentHover.original.temperature, tempUnit)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400">
                <span>Rain Chance:</span>
                <span className="font-mono text-blue-300 tabular-nums">
                  {currentHover.original.precipitationProbability}%
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>Wind:</span>
                <span className="font-mono text-emerald-300 tabular-nums">
                  {formatWind(currentHover.original.windSpeed, windUnit)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Scroller for Hourly Cards */}
      <div className="mt-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {data.slice(0, 16).map((item, idx) => {
            const cond = getWeatherCondition(item.weatherCode);
            const isSelected = activeIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx === activeIndex ? null : idx)}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl min-w-[78px] transition-all duration-150 border text-center shrink-0 ${
                  isSelected
                    ? 'bg-slate-800 border-sky-500/80 shadow-md ring-1 ring-sky-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <span className="text-[11px] font-mono text-slate-400 tabular-nums whitespace-nowrap">
                  {item.formattedTime}
                </span>

                <div className="my-1.5 p-1 rounded-full bg-slate-900/80 text-amber-300">
                  <WeatherIcon
                    code={item.weatherCode}
                    isDay={item.isDay}
                    className="w-4 h-4"
                  />
                </div>

                <span className="text-xs font-semibold text-white font-mono tabular-nums">
                  {formatTemp(item.temperature, tempUnit)}
                </span>

                <div className="flex items-center gap-0.5 text-[10px] text-blue-400 font-mono mt-1">
                  <Droplets className="w-2.5 h-2.5" />
                  <span>{item.precipitationProbability}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
