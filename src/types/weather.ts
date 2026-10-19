export interface GeoLocationResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  population?: number;
}

export interface GeocodingResponse {
  results?: GeoLocationResult[];
  generationtime_ms?: number;
}

export interface RawWeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather?: {
    time: string;
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    is_day: number;
  };
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    cloud_cover?: number;
    pressure_msl?: number;
    surface_pressure?: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m?: number;
    uv_index?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature?: number[];
    relative_humidity_2m?: number[];
    precipitation_probability?: number[];
    precipitation?: number[];
    weather_code?: number[];
    weathercode?: number[];
    surface_pressure?: number[];
    wind_speed_10m?: number[];
    windspeed_10m?: number[];
    uv_index?: number[];
    is_day?: number[];
  };
  daily?: {
    time: string[];
    weather_code?: number[];
    weathercode?: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max?: number[];
    apparent_temperature_min?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
    wind_speed_10m_max?: number[];
    windspeed_10m_max?: number[];
    uv_index_max?: number[];
    sunrise?: string[];
    sunset?: string[];
  };
}

export interface HourlyPoint {
  time: string;
  formattedTime: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  uvIndex: number;
  isDay: boolean;
}

export interface DailyPoint {
  date: string;
  dayName: string;
  formattedDate: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentMax?: number;
  apparentMin?: number;
  precipitationSum: number;
  precipitationProbability: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise?: string;
  sunset?: string;
}

export interface CurrentWeatherState {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  uvIndex: number;
  surfacePressure: number;
  windGusts?: number;
  cloudCover?: number;
}

export interface ProcessedWeatherData {
  location: GeoLocationResult;
  current: CurrentWeatherState;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  elevation: number;
  timezone: string;
  lastUpdated: string;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';

export interface WeatherConditionInfo {
  code: number;
  label: string;
  description: string;
  iconName: string;
  category: 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
  gradient: string;
  accentColor: string;
}
