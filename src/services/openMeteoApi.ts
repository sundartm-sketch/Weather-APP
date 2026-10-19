import {
  GeoLocationResult,
  GeocodingResponse,
  ProcessedWeatherData,
  RawWeatherData,
  HourlyPoint,
  DailyPoint,
} from '../types/weather';

export const POPULAR_CITIES: GeoLocationResult[] = [
  {
    id: 1850147,
    name: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917,
    country_code: 'JP',
    country: 'Japan',
    timezone: 'Asia/Tokyo',
  },
  {
    id: 5128581,
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    country_code: 'US',
    country: 'United States',
    admin1: 'New York',
    timezone: 'America/New_York',
  },
  {
    id: 2643743,
    name: 'London',
    latitude: 51.5085,
    longitude: -0.1257,
    country_code: 'GB',
    country: 'United Kingdom',
    timezone: 'Europe/London',
  },
  {
    id: 2988507,
    name: 'Paris',
    latitude: 48.8534,
    longitude: 2.3488,
    country_code: 'FR',
    country: 'France',
    timezone: 'Europe/Paris',
  },
  {
    id: 2147714,
    name: 'Sydney',
    latitude: -33.8678,
    longitude: 151.2073,
    country_code: 'AU',
    country: 'Australia',
    timezone: 'Australia/Sydney',
  },
  {
    id: 292223,
    name: 'Dubai',
    latitude: 25.2048,
    longitude: 55.2708,
    country_code: 'AE',
    country: 'United Arab Emirates',
    timezone: 'Asia/Dubai',
  },
  {
    id: 3413829,
    name: 'Reykjavik',
    latitude: 64.1355,
    longitude: -21.8954,
    country_code: 'IS',
    country: 'Iceland',
    timezone: 'Atlantic/Reykjavik',
  },
];

/**
 * Searches cities using Open-Meteo Geocoding API
 */
export async function searchCities(
  query: string,
  signal?: AbortSignal
): Promise<GeoLocationResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=10&language=en&format=json`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`Geocoding server responded with status: ${res.status}`);
    }
    const data: GeocodingResponse = await res.json();
    return data.results || [];
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return [];
    }
    console.error('Failed to search cities:', err);
    throw err;
  }
}

/**
 * Fetches comprehensive weather data from Open-Meteo Forecast API
 */
export async function fetchWeatherData(
  location: GeoLocationResult,
  signal?: AbortSignal
): Promise<ProcessedWeatherData> {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current_weather: 'true',
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index',
    hourly:
      'temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,relative_humidity_2m,wind_speed_10m,uv_index,is_day',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset',
    timezone: location.timezone || 'auto',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Open-Meteo Forecast API returned ${res.status}: ${res.statusText}`);
  }

  const raw: RawWeatherData = await res.json();

  // Parse Current Weather with fallbacks across both current and current_weather payloads
  const cur = raw.current;
  const curWeather = raw.current_weather;

  const temperature = cur?.temperature_2m ?? curWeather?.temperature ?? 0;
  const feelsLike = cur?.apparent_temperature ?? temperature;
  const humidity = cur?.relative_humidity_2m ?? 50;
  const windSpeed = cur?.wind_speed_10m ?? curWeather?.windspeed ?? 0;
  const windDirection = cur?.wind_direction_10m ?? curWeather?.winddirection ?? 0;
  const weatherCode = cur?.weather_code ?? curWeather?.weathercode ?? 0;
  const isDay = (cur?.is_day ?? curWeather?.is_day ?? 1) === 1;
  const precipitation = cur?.precipitation ?? 0;
  const uvIndex = cur?.uv_index ?? 0;
  const surfacePressure = cur?.surface_pressure ?? 1013;
  const windGusts = cur?.wind_gusts_10m;
  const cloudCover = cur?.cloud_cover;

  // Process Hourly data (next 48 hours)
  const hourlyPoints: HourlyPoint[] = [];
  if (raw.hourly && raw.hourly.time) {
    const times = raw.hourly.time;
    const nowIso = cur?.time ?? curWeather?.time ?? new Date().toISOString();
    const startIndex = Math.max(
      0,
      times.findIndex(t => t >= nowIso.slice(0, 13))
    );
    const sliceCount = 36; // 36 hours lookahead

    for (let i = startIndex; i < Math.min(times.length, startIndex + sliceCount); i++) {
      const timeStr = times[i];
      const dateObj = new Date(timeStr);
      const formattedTime = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
      });

      const weatherCodes = raw.hourly.weather_code ?? raw.hourly.weathercode ?? [];
      const windSpeeds = raw.hourly.wind_speed_10m ?? raw.hourly.windspeed_10m ?? [];

      hourlyPoints.push({
        time: timeStr,
        formattedTime,
        temperature: raw.hourly.temperature_2m?.[i] ?? 0,
        apparentTemperature: raw.hourly.apparent_temperature?.[i] ?? raw.hourly.temperature_2m?.[i] ?? 0,
        humidity: raw.hourly.relative_humidity_2m?.[i] ?? 0,
        precipitationProbability: raw.hourly.precipitation_probability?.[i] ?? 0,
        precipitation: raw.hourly.precipitation?.[i] ?? 0,
        weatherCode: weatherCodes[i] ?? 0,
        windSpeed: windSpeeds[i] ?? 0,
        uvIndex: raw.hourly.uv_index?.[i] ?? 0,
        isDay: (raw.hourly.is_day?.[i] ?? 1) === 1,
      });
    }
  }

  // Process Daily data (7 days)
  const dailyPoints: DailyPoint[] = [];
  if (raw.daily && raw.daily.time) {
    const times = raw.daily.time;
    const weatherCodes = raw.daily.weather_code ?? raw.daily.weathercode ?? [];
    const windSpeeds = raw.daily.wind_speed_10m_max ?? raw.daily.windspeed_10m_max ?? [];

    for (let i = 0; i < Math.min(7, times.length); i++) {
      const dateStr = times[i];
      // Note: Parse date with year, month, day to avoid local timezone offset shifts
      const [year, month, day] = dateStr.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);

      const isToday = i === 0;
      const dayName = isToday
        ? 'Today'
        : i === 1
        ? 'Tomorrow'
        : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      dailyPoints.push({
        date: dateStr,
        dayName,
        formattedDate,
        weatherCode: weatherCodes[i] ?? 0,
        tempMax: Math.round(raw.daily.temperature_2m_max[i]),
        tempMin: Math.round(raw.daily.temperature_2m_min[i]),
        apparentMax: raw.daily.apparent_temperature_max?.[i]
          ? Math.round(raw.daily.apparent_temperature_max[i])
          : undefined,
        apparentMin: raw.daily.apparent_temperature_min?.[i]
          ? Math.round(raw.daily.apparent_temperature_min[i])
          : undefined,
        precipitationSum: raw.daily.precipitation_sum?.[i] ?? 0,
        precipitationProbability: raw.daily.precipitation_probability_max?.[i] ?? 0,
        windSpeedMax: Math.round(windSpeeds[i] ?? 0),
        uvIndexMax: raw.daily.uv_index_max?.[i] ?? 0,
        sunrise: raw.daily.sunrise?.[i],
        sunset: raw.daily.sunset?.[i],
      });
    }
  }

  return {
    location,
    current: {
      time: cur?.time ?? curWeather?.time ?? new Date().toISOString(),
      temperature,
      feelsLike,
      humidity,
      windSpeed,
      windDirection,
      weatherCode,
      isDay,
      precipitation,
      uvIndex,
      surfacePressure,
      windGusts,
      cloudCover,
    },
    hourly: hourlyPoints,
    daily: dailyPoints,
    elevation: raw.elevation,
    timezone: raw.timezone,
    lastUpdated: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

/**
 * Helper to convert temperature between Celsius and Fahrenheit
 */
export function formatTemp(celsius: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') {
    const f = (celsius * 9) / 5 + 32;
    return `${Math.round(f)}°`;
  }
  return `${Math.round(celsius)}°`;
}

/**
 * Format wind speed based on selected unit
 */
export function formatWind(kmh: number, unit: 'kmh' | 'mph' | 'ms'): string {
  if (unit === 'mph') {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  if (unit === 'ms') {
    return `${(kmh / 3.6).toFixed(1)} m/s`;
  }
  return `${Math.round(kmh)} km/h`;
}
