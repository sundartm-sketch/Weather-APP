import React, { useState, useEffect, useCallback } from 'react';
import {
  GeoLocationResult,
  ProcessedWeatherData,
  TemperatureUnit,
  WindSpeedUnit,
} from './types/weather';
import { fetchWeatherData, POPULAR_CITIES } from './services/openMeteoApi';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { HourlyTrendChart } from './components/HourlyTrendChart';
import { DailyForecastView } from './components/DailyForecastView';
import { SmartRecommendations } from './components/SmartRecommendations';
import { ErrorState } from './components/ErrorState';
import { SkeletonLoader } from './components/SkeletonLoader';

export default function App() {
  // Default to Tokyo or user saved city
  const [currentLocation, setCurrentLocation] = useState<GeoLocationResult>(() => {
    try {
      const saved = localStorage.getItem('atmosphere_last_city');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return POPULAR_CITIES[0]; // Tokyo
  });

  const [weatherData, setWeatherData] = useState<ProcessedWeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Unit settings
  const [tempUnit, setTempUnit] = useState<TemperatureUnit>(() => {
    try {
      const saved = localStorage.getItem('atmosphere_temp_unit');
      if (saved === 'fahrenheit' || saved === 'celsius') return saved;
    } catch {
      // ignore
    }
    return 'celsius';
  });

  const [windUnit, setWindUnit] = useState<WindSpeedUnit>(() => {
    try {
      const saved = localStorage.getItem('atmosphere_wind_unit');
      if (saved === 'mph' || saved === 'kmh' || saved === 'ms') return saved;
    } catch {
      // ignore
    }
    return 'kmh';
  });

  // Toggle handlers
  const handleToggleTempUnit = () => {
    const next = tempUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    setTempUnit(next);
    try {
      localStorage.setItem('atmosphere_temp_unit', next);
    } catch {
      // ignore
    }
  };

  const handleToggleWindUnit = () => {
    const order: WindSpeedUnit[] = ['kmh', 'mph', 'ms'];
    const next = order[(order.indexOf(windUnit) + 1) % order.length];
    setWindUnit(next);
    try {
      localStorage.setItem('atmosphere_wind_unit', next);
    } catch {
      // ignore
    }
  };

  // Fetch Weather
  const loadWeather = useCallback(async (location: GeoLocationResult, silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const data = await fetchWeatherData(location);
      setWeatherData(data);
      try {
        localStorage.setItem('atmosphere_last_city', JSON.stringify(location));
      } catch {
        // ignore
      }
    } catch (err: unknown) {
      console.error('Failed to fetch weather:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to connect to Open-Meteo meteorological servers. Please check your connection and try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch on location change
  useEffect(() => {
    loadWeather(currentLocation);
  }, [currentLocation, loadWeather]);

  // Handle City Select
  const handleSelectCity = (city: GeoLocationResult) => {
    setCurrentLocation(city);
  };

  // Handle Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your current browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const localLoc: GeoLocationResult = {
          id: Date.now(),
          name: 'Current Coordinates',
          latitude: parseFloat(latitude.toFixed(4)),
          longitude: parseFloat(longitude.toFixed(4)),
          admin1: 'GPS Fix',
          country: 'Local Device',
          country_code: 'LOC',
        };

        // Try reverse geocoding via Open-Meteo or free nominatim if possible, otherwise use coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const geo = await res.json();
            const cityName =
              geo.address?.city ||
              geo.address?.town ||
              geo.address?.village ||
              geo.address?.municipality ||
              'My Location';
            localLoc.name = cityName;
            localLoc.country = geo.address?.country;
            localLoc.country_code = geo.address?.country_code?.toUpperCase();
            localLoc.admin1 = geo.address?.state || geo.address?.county;
          }
        } catch {
          // Coords fallback is completely fine
        }

        setCurrentLocation(localLoc);
        setIsLocating(false);
      },
      error => {
        setIsLocating(false);
        let errorTxt = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorTxt = 'Location access was denied. Please search for your city manually above.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorTxt = 'Location information is currently unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorTxt = 'Location request timed out. Please try again or search manually.';
        }
        setErrorMessage(errorTxt);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        tempUnit={tempUnit}
        onToggleTempUnit={handleToggleTempUnit}
        windUnit={windUnit}
        onToggleWindUnit={handleToggleWindUnit}
        onRefresh={() => loadWeather(currentLocation, true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search Bar & Fast Selectors */}
        <div className="max-w-3xl mx-auto">
          <SearchBar
            onSelectCity={handleSelectCity}
            onUseCurrentLocation={handleUseCurrentLocation}
            isLocating={isLocating}
            selectedCityName={currentLocation.name}
          />
        </div>

        {/* Error State */}
        {errorMessage ? (
          <ErrorState
            message={errorMessage}
            onRetry={() => loadWeather(currentLocation)}
            onSelectCity={handleSelectCity}
          />
        ) : isLoading && !weatherData ? (
          <SkeletonLoader />
        ) : weatherData ? (
          <div className="space-y-8">
            {/* Section 1: Current Weather Overview */}
            <section id="overview" className="scroll-mt-20">
              <CurrentWeatherCard
                weather={weatherData}
                tempUnit={tempUnit}
                windUnit={windUnit}
              />
            </section>

            {/* Section 2: Hourly Atmospheric Trend Chart */}
            <section id="trend" className="scroll-mt-20">
              <HourlyTrendChart
                hourly={weatherData.hourly}
                tempUnit={tempUnit}
                windUnit={windUnit}
              />
            </section>

            {/* Section 3: 7-Day Interactive Forecast */}
            <section id="forecast" className="scroll-mt-20">
              <DailyForecastView
                daily={weatherData.daily}
                tempUnit={tempUnit}
                windUnit={windUnit}
              />
            </section>

            {/* Section 4: Smart Weather Intelligence & Planning */}
            <section id="intelligence" className="scroll-mt-20">
              <SmartRecommendations
                current={weatherData.current}
                daily={weatherData.daily}
              />
            </section>
          </div>
        ) : null}
      </main>

      {/* Quiet, Minimalist Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Atmosphere</span>
            <span>·</span>
            <span>Open-Meteo High-Resolution Weather Model Integration</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Lat {currentLocation.latitude.toFixed(2)}°</span>
            <span>Lon {currentLocation.longitude.toFixed(2)}°</span>
            <span>WMO Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
