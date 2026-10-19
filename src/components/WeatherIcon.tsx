import React from 'react';
import {
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
  Moon,
  CloudMoon,
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  className = 'w-6 h-6',
  size,
}) => {
  // Clear sky
  if (code === 0) {
    if (!isDay) return <Moon className={className} size={size} />;
    return <Sun className={className} size={size} />;
  }
  // Mainly clear
  if (code === 1) {
    if (!isDay) return <Moon className={className} size={size} />;
    return <SunMedium className={className} size={size} />;
  }
  // Partly cloudy
  if (code === 2) {
    if (!isDay) return <CloudMoon className={className} size={size} />;
    return <CloudSun className={className} size={size} />;
  }
  // Overcast
  if (code === 3) {
    return <Cloud className={className} size={size} />;
  }
  // Fog
  if (code === 45 || code === 48) {
    return <CloudFog className={className} size={size} />;
  }
  // Drizzle
  if (code >= 51 && code <= 55) {
    return <CloudDrizzle className={className} size={size} />;
  }
  // Freezing drizzle / rain
  if (code === 56 || code === 57 || code === 66 || code === 67) {
    return <CloudSnow className={className} size={size} />;
  }
  // Rain
  if (code >= 61 && code <= 65) {
    return <CloudRain className={className} size={size} />;
  }
  // Showers
  if (code === 80 || code === 81) {
    return <CloudRain className={className} size={size} />;
  }
  if (code === 82) {
    return <CloudRainWind className={className} size={size} />;
  }
  // Snow
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return <Snowflake className={className} size={size} />;
  }
  // Thunderstorm
  if (code >= 95) {
    return <CloudLightning className={className} size={size} />;
  }

  return <Cloud className={className} size={size} />;
};
