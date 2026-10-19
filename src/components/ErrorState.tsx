import React from 'react';
import { AlertCircle, RefreshCw, MapPin } from 'lucide-react';
import { POPULAR_CITIES } from '../services/openMeteoApi';
import { GeoLocationResult } from '../types/weather';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onSelectCity?: (city: GeoLocationResult) => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
  onSelectCity,
}) => {
  return (
    <div className="bg-slate-900/80 border border-rose-900/50 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-5 shadow-2xl backdrop-blur-md">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Weather Data Unavailable</h3>
        <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
          {message || 'An unexpected error occurred while communicating with the Open-Meteo API.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs shadow-md transition-colors w-full sm:w-auto justify-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </button>
      </div>

      {onSelectCity && (
        <div className="pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-400 block mb-2">
            Or select a verified metropolitan center:
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_CITIES.slice(0, 4).map(city => (
              <button
                key={city.id}
                onClick={() => onSelectCity(city)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <MapPin className="w-3 h-3 text-sky-400" />
                <span>{city.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
