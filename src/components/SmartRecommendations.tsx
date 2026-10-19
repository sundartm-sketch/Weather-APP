import React, { useState } from 'react';
import { CurrentWeatherState, DailyPoint } from '../types/weather';
import {
  generateOutfitRecommendation,
  generateActivityIndices,
  generateTravelAdvisories,
  generatePackingChecklist,
} from '../utils/recommendations';
import {
  Umbrella,
  Sun,
  Shield,
  Compass,
  Shirt,
  Luggage,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Footprints,
  Layers,
} from 'lucide-react';

interface SmartRecommendationsProps {
  current: CurrentWeatherState;
  daily: DailyPoint[];
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  current,
  daily,
}) => {
  const [activeTab, setActiveTab] = useState<'outfit' | 'activities' | 'travel' | 'packing'>('outfit');

  const today = daily[0];
  const outfit = generateOutfitRecommendation(current, today);
  const activities = generateActivityIndices(current, today);
  const advisories = generateTravelAdvisories(current, today);
  const packingList = generatePackingChecklist(daily);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-6">
      {/* Header and Subsystem Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              Decision Intelligence
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs text-sky-400 font-mono">Meteorological Advisory</span>
          </div>
          <h3 className="text-lg font-semibold text-white mt-1">
            Smart Outfit & Travel Planning
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('outfit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'outfit'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Outfit Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'activities'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Activity Index</span>
          </button>
          <button
            onClick={() => setActiveTab('travel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'travel'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Travel Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab('packing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'packing'
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Luggage className="w-3.5 h-3.5" />
            <span>Trip Packing</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Outfit Guide */}
      {activeTab === 'outfit' && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/40 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold font-mono">
                Attire Summary
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {outfit.summary}
              </p>
            </div>
          </div>

          {/* Quick Alert Badges: Umbrella, Sunscreen, Cold */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Umbrella card */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                outfit.umbrellaNeeded
                  ? 'bg-blue-950/40 border-blue-800/60 text-blue-200'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  outfit.umbrellaNeeded ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-900 text-slate-500'
                }`}
              >
                <Umbrella className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  {outfit.umbrellaNeeded ? 'Umbrella Essential' : 'No Umbrella Needed'}
                </span>
                <p className="text-xs mt-1 leading-relaxed">
                  {outfit.umbrellaReason || 'Precipitation risk is minimal today.'}
                </p>
              </div>
            </div>

            {/* Sunscreen card */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                outfit.sunProtectionNeeded
                  ? 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  outfit.sunProtectionNeeded ? 'bg-amber-600/20 text-amber-400' : 'bg-slate-900 text-slate-500'
                }`}
              >
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  {outfit.sunProtectionNeeded ? 'Sun Protection Advised' : 'Low Solar Hazard'}
                </span>
                <p className="text-xs mt-1 leading-relaxed">
                  {outfit.sunProtectionAdvice || 'UV radiation is at safe baseline levels.'}
                </p>
              </div>
            </div>

            {/* Cold Protection */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                outfit.coldProtectionNeeded
                  ? 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  outfit.coldProtectionNeeded ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-900 text-slate-500'
                }`}
              >
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  {outfit.coldProtectionNeeded ? 'Thermal Layering Active' : 'Mild Ambient Temperature'}
                </span>
                <p className="text-xs mt-1 leading-relaxed">
                  {outfit.coldProtectionAdvice || 'No heavy cold insulation required.'}
                </p>
              </div>
            </div>
          </div>

          {/* Outfit Piece Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tops */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Base Layer & Top
              </span>
              <p className="text-sm font-medium text-slate-100">{outfit.tops}</p>
            </div>

            {/* Bottoms */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Bottoms & Trousers
              </span>
              <p className="text-sm font-medium text-slate-100">{outfit.bottoms}</p>
            </div>

            {/* Outerwear */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Outerwear & Shell
              </span>
              <p className="text-sm font-medium text-slate-100">{outfit.outerwear}</p>
            </div>

            {/* Footwear */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Footwear
              </span>
              <p className="text-sm font-medium text-slate-100">{outfit.footwear}</p>
            </div>
          </div>

          {/* Recommended Accessories Tags */}
          {outfit.accessories.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block mb-2">
                Essential Day Accessories
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {outfit.accessories.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700/80 px-3 py-1 rounded-lg"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Activity Indices */}
      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map(act => (
            <div
              key={act.name}
              className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{act.name}</h4>
                  <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                    Score: {act.score}/100
                  </span>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-md border font-mono uppercase tracking-wider ${act.badgeColor}`}
                >
                  {act.rating}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    act.rating === 'Optimal'
                      ? 'bg-emerald-400'
                      : act.rating === 'Good'
                      ? 'bg-sky-400'
                      : act.rating === 'Caution'
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${act.score}%` }}
                />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{act.advice}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Travel Alerts */}
      {activeTab === 'travel' && (
        <div className="space-y-3">
          {advisories.map((adv, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                adv.severity === 'high'
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                  : adv.severity === 'moderate'
                  ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                  : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
              }`}
            >
              {adv.severity === 'high' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : adv.severity === 'moderate' ? (
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{adv.title}</h4>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-slate-900/60 border border-slate-700/60 text-slate-300">
                    {adv.severity} severity
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{adv.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Packing Checklist */}
      {activeTab === 'packing' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h4 className="text-sm font-semibold text-white mb-1">
              7-Day Luggage & Packing Checklist
            </h4>
            <p className="text-xs text-slate-400">
              Dynamically derived from temperature extremes, precipitation probability, and wind forecasts for this city.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {packingList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
