import { CurrentWeatherState, DailyPoint } from '../types/weather';
import { getWeatherCondition } from './weatherCodes';

export interface OutfitRecommendation {
  summary: string;
  tops: string;
  bottoms: string;
  outerwear: string;
  footwear: string;
  accessories: string[];
  umbrellaNeeded: boolean;
  umbrellaReason?: string;
  sunProtectionNeeded: boolean;
  sunProtectionAdvice?: string;
  coldProtectionNeeded: boolean;
  coldProtectionAdvice?: string;
}

export interface ActivityIndex {
  name: string;
  score: number; // 0 - 100
  rating: 'Optimal' | 'Good' | 'Caution' | 'Poor';
  badgeColor: string;
  advice: string;
}

export interface TravelAdvisory {
  severity: 'low' | 'moderate' | 'high';
  title: string;
  message: string;
  iconType: 'wind' | 'rain' | 'sun' | 'cold' | 'fog' | 'ideal';
}

export function generateOutfitRecommendation(
  current: CurrentWeatherState,
  todayDaily?: DailyPoint
): OutfitRecommendation {
  const temp = current.temperature;
  const feelsLike = current.feelsLike;
  const wind = current.windSpeed;
  const uv = current.uvIndex ?? todayDaily?.uvIndexMax ?? 0;
  const rainProb = todayDaily?.precipitationProbability ?? (current.precipitation > 0 ? 90 : 10);
  const condition = getWeatherCondition(current.weatherCode);

  const isRainingOrWet =
    condition.category === 'rain' ||
    condition.category === 'drizzle' ||
    condition.category === 'thunderstorm' ||
    rainProb > 40;

  const isSnowing = condition.category === 'snow';

  // Umbrella logic
  const umbrellaNeeded = isRainingOrWet;
  let umbrellaReason = undefined;
  if (condition.category === 'thunderstorm') {
    umbrellaReason = 'Severe convective downpours expected; carry a sturdy storm umbrella.';
  } else if (isRainingOrWet) {
    umbrellaReason = `Precipitation probability at ${rainProb}%; keep an umbrella or waterproof shell handy.`;
  }

  // Sun protection
  const sunProtectionNeeded = uv >= 3;
  let sunProtectionAdvice = undefined;
  if (uv >= 8) {
    sunProtectionAdvice = 'Very high UV index. Broad-spectrum SPF 50+, wide-brim hat, and sunglasses essential.';
  } else if (uv >= 6) {
    sunProtectionAdvice = 'High UV radiation. Apply SPF 30+ sunscreen and wear UV-rated sunglasses.';
  } else if (uv >= 3) {
    sunProtectionAdvice = 'Moderate UV. Sunglasses and facial sunscreen recommended during midday.';
  }

  // Cold protection
  const coldProtectionNeeded = feelsLike < 8;
  let coldProtectionAdvice = undefined;
  if (feelsLike < 0) {
    coldProtectionAdvice = 'Sub-freezing temperatures. Insulated thermal base layers, down parka, gloves, and beanie.';
  } else if (feelsLike < 8) {
    coldProtectionAdvice = 'Brisk chilly air. Heavy fleece or woolen coat with a scarf.';
  }

  // Build clothing items
  let tops = '';
  let bottoms = '';
  let outerwear = '';
  let footwear = '';
  const accessories: string[] = [];

  if (feelsLike >= 28) {
    tops = 'Ultra-light breathable t-shirt, linen shirt, or airy tank';
    bottoms = 'Linen trousers, breathable shorts, or light skirt';
    outerwear = 'No outer layer required; keep a light cotton overshirt for indoor A/C';
    footwear = 'Breathable walking sneakers, woven slip-ons, or supportive sandals';
    accessories.push('Polarized Sunglasses', 'UV Sun Hat', 'Hydration Flask');
  } else if (feelsLike >= 20) {
    tops = 'Classic cotton crewneck, short-sleeve polo, or soft chambray';
    bottoms = 'Chino trousers, light denim, or casual tailored pants';
    outerwear = 'Light cardigan, chore jacket, or windbreaker for the evening breeze';
    footwear = 'Canvas low-tops, clean sneakers, or loafers';
    accessories.push('Sunglasses');
  } else if (feelsLike >= 13) {
    tops = 'Long-sleeve henley, merino sweater, or light knit turtleneck';
    bottoms = 'Medium-weight denim, wool-blend trousers, or cords';
    outerwear = 'Structured trench coat, denim jacket, or lightweight quilted jacket';
    footwear = 'Leather ankle boots, waterproof trainers, or sturdy brogues';
    accessories.push('Light scarf');
  } else if (feelsLike >= 4) {
    tops = 'Thermal base tee under an insulated wool sweater';
    bottoms = 'Heavy denim, fleece-lined trousers, or thermal-lined pants';
    outerwear = 'Heavy wool overcoat, padded puffer jacket, or insulated parka';
    footwear = 'Insulated leather boots, water-resistant trail shoes';
    accessories.push('Knit Beanie', 'Warm Wool Scarf', 'Light Gloves');
  } else {
    // Extreme cold
    tops = 'Merino wool thermal base layer + heavy fleece mid-layer';
    bottoms = 'Windproof insulated trousers with thermal long johns';
    outerwear = 'Heavy goose-down parka with storm hood & windproofing';
    footwear = 'Shearling-lined waterproof snow boots with thermal wool socks';
    accessories.push('Insulated Beanie', 'Cashmere Scarf', 'Windproof Touchscreen Gloves');
  }

  // Weather overrides
  if (isRainingOrWet) {
    outerwear = `${outerwear ? outerwear + ' with a ' : ''}Waterproof DWR shell or raincoat`;
    footwear = 'Waterproof Gore-Tex shoes or treated leather boots';
    accessories.push('Compact Umbrella');
  }

  if (isSnowing) {
    outerwear = 'Water-repellent insulated winter parka with sealed seams';
    footwear = 'Deep-lug snow boots with anti-slip grip';
    accessories.push('Thermal Gloves', 'Thermal Beanie', 'Neck Gaiter');
  }

  if (wind > 32) {
    accessories.push('Wind-resistant Shell');
  }

  if (sunProtectionNeeded && !accessories.includes('Sunglasses') && !accessories.includes('Polarized Sunglasses')) {
    accessories.push('UV Sunglasses');
  }

  const summary = `Today calls for ${
    feelsLike >= 24
      ? 'light breathable fabrics'
      : feelsLike >= 14
      ? 'smart seasonal layering'
      : 'warm protective insulation'
  }${isRainingOrWet ? ' and reliable wet-weather gear' : ''}.`;

  return {
    summary,
    tops,
    bottoms,
    outerwear,
    footwear,
    accessories,
    umbrellaNeeded,
    umbrellaReason,
    sunProtectionNeeded,
    sunProtectionAdvice,
    coldProtectionNeeded,
    coldProtectionAdvice,
  };
}

export function generateActivityIndices(
  current: CurrentWeatherState,
  todayDaily?: DailyPoint
): ActivityIndex[] {
  const temp = current.temperature;
  const wind = current.windSpeed;
  const rainProb = todayDaily?.precipitationProbability ?? (current.precipitation > 0 ? 90 : 10);
  const condition = getWeatherCondition(current.weatherCode);

  // 1. Running & Outdoor Fitness
  let runningScore = 100;
  if (temp < 0) runningScore -= 30;
  else if (temp < 6) runningScore -= 10;
  else if (temp > 28) runningScore -= 25;
  else if (temp > 33) runningScore -= 45;

  if (rainProb > 60) runningScore -= 35;
  else if (rainProb > 25) runningScore -= 15;

  if (wind > 35) runningScore -= 25;
  else if (wind > 20) runningScore -= 10;

  if (condition.category === 'thunderstorm') runningScore = 10;
  runningScore = Math.max(10, Math.min(100, runningScore));

  const getRating = (s: number): ActivityIndex['rating'] => {
    if (s >= 80) return 'Optimal';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Caution';
    return 'Poor';
  };

  const getBadgeColor = (r: ActivityIndex['rating']) => {
    switch (r) {
      case 'Optimal':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
      case 'Good':
        return 'text-sky-400 bg-sky-950/60 border-sky-800/60';
      case 'Caution':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      case 'Poor':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
    }
  };

  const runningRating = getRating(runningScore);

  // 2. Sightseeing & Urban Walking
  let sightseeingScore = 100;
  if (condition.category === 'rain' || condition.category === 'thunderstorm') sightseeingScore -= 45;
  if (condition.category === 'snow') sightseeingScore -= 20;
  if (temp < 2 || temp > 32) sightseeingScore -= 25;
  if (rainProb > 50) sightseeingScore -= 25;
  sightseeingScore = Math.max(15, Math.min(100, sightseeingScore));
  const sightseeingRating = getRating(sightseeingScore);

  // 3. Stargazing / Night Astronomy
  let stargazingScore = 95;
  if (condition.category === 'cloudy' || current.cloudCover && current.cloudCover > 60) stargazingScore -= 50;
  if (condition.category === 'rain' || condition.category === 'fog') stargazingScore -= 65;
  if (rainProb > 30) stargazingScore -= 20;
  stargazingScore = Math.max(10, Math.min(100, stargazingScore));
  const stargazingRating = getRating(stargazingScore);

  // 4. Outdoor Dining & Patios
  let diningScore = 100;
  if (temp < 15 || temp > 30) diningScore -= 30;
  if (rainProb > 25) diningScore -= 40;
  if (wind > 25) diningScore -= 30;
  if (condition.category === 'thunderstorm' || condition.category === 'rain') diningScore = 15;
  diningScore = Math.max(10, Math.min(100, diningScore));
  const diningRating = getRating(diningScore);

  return [
    {
      name: 'Outdoor Running & Fitness',
      score: runningScore,
      rating: runningRating,
      badgeColor: getBadgeColor(runningRating),
      advice:
        runningScore >= 80
          ? 'Crisp air and pleasant temperature make this an ideal window for cardio or trail running.'
          : runningScore >= 60
          ? 'Comfortable conditions; maintain proper hydration and monitor wind resistance.'
          : 'Suboptimal conditions due to precipitation or thermal extremes; consider indoor training.',
    },
    {
      name: 'Urban Sightseeing & Walking',
      score: sightseeingScore,
      rating: sightseeingRating,
      badgeColor: getBadgeColor(sightseeingRating),
      advice:
        sightseeingScore >= 80
          ? 'Clear pathways and comfortable ambient temps make walking tours pleasant.'
          : sightseeingScore >= 60
          ? 'Pleasant overall, but keep an umbrella or light jacket within reach.'
          : 'Pavement slicks or precipitation may dampen extended outdoor foot tours.',
    },
    {
      name: 'Stargazing & Night Sky',
      score: stargazingScore,
      rating: stargazingRating,
      badgeColor: getBadgeColor(stargazingRating),
      advice:
        stargazingScore >= 80
          ? 'Low cloud density and high visibility provide exceptional night sky viewing.'
          : stargazingScore >= 60
          ? 'Partially clear celestial viewing; look toward breaks in the cloud cover.'
          : 'Dense cloud ceiling or precipitation obscures astronomical observation.',
    },
    {
      name: 'Outdoor Dining & Patios',
      score: diningScore,
      rating: diningRating,
      badgeColor: getBadgeColor(diningRating),
      advice:
        diningScore >= 80
          ? 'Gentle breeze and mild temperature create prime conditions for patio seating.'
          : diningScore >= 60
          ? 'Covered terrace or sheltered patio recommended for dining comfort.'
          : 'Indoor dining advised due to precipitation, high winds, or thermal discomfort.',
    },
  ];
}

export function generateTravelAdvisories(
  current: CurrentWeatherState,
  todayDaily?: DailyPoint
): TravelAdvisory[] {
  const advisories: TravelAdvisory[] = [];
  const condition = getWeatherCondition(current.weatherCode);
  const wind = current.windSpeed;
  const rainProb = todayDaily?.precipitationProbability ?? (current.precipitation > 0 ? 80 : 0);

  if (condition.category === 'thunderstorm') {
    advisories.push({
      severity: 'high',
      title: 'Convective Storm Alert',
      message: 'Lightning discharges, turbulent gusts, and sudden water accumulation may affect local flights and highway transit.',
      iconType: 'rain',
    });
  } else if (condition.category === 'rain' && (current.precipitation > 2 || rainProb > 70)) {
    advisories.push({
      severity: 'moderate',
      title: 'Wet Roadways & Spray Hazard',
      message: 'Active rainfall reduces highway friction and braking distances. Increase following distance.',
      iconType: 'rain',
    });
  }

  if (wind >= 40) {
    advisories.push({
      severity: 'high',
      title: 'High Wind / Gale Advisory',
      message: `Brisk gusts reaching ${Math.round(wind)} km/h. High-profile vehicles, cycling, and bridge crossings require extreme caution.`,
      iconType: 'wind',
    });
  } else if (wind >= 28) {
    advisories.push({
      severity: 'moderate',
      title: 'Brisk Surface Winds',
      message: `Moderate sustained wind speed at ${Math.round(wind)} km/h. Secure loose outdoor belongings.`,
      iconType: 'wind',
    });
  }

  if (condition.category === 'fog') {
    advisories.push({
      severity: 'moderate',
      title: 'Reduced Surface Visibility',
      message: 'Dense fog bank reported. Airport arrival holds or vehicle speed restrictions may be active.',
      iconType: 'fog',
    });
  }

  if (current.uvIndex >= 7) {
    advisories.push({
      severity: 'moderate',
      title: 'Elevated Solar Radiation',
      message: `UV index peak at ${current.uvIndex.toFixed(1)}. Skin damage possible in under 20 minutes without sun protection.`,
      iconType: 'sun',
    });
  }

  if (current.feelsLike < 0) {
    advisories.push({
      severity: 'moderate',
      title: 'Sub-Zero Freeze Hazard',
      message: 'Persistent sub-freezing temperatures create potential black ice patches on bridges and walkways.',
      iconType: 'cold',
    });
  }

  if (advisories.length === 0) {
    advisories.push({
      severity: 'low',
      title: 'Favorable Travel Conditions',
      message: 'Meteorological sensors indicate calm, clear conditions with minimal transit or aviation disruption.',
      iconType: 'ideal',
    });
  }

  return advisories;
}

export function generatePackingChecklist(daily: DailyPoint[]): string[] {
  const checklist = new Set<string>();

  const maxTemp = Math.max(...daily.map(d => d.tempMax));
  const minTemp = Math.min(...daily.map(d => d.tempMin));
  const maxRainProb = Math.max(...daily.map(d => d.precipitationProbability));
  const maxUV = Math.max(...daily.map(d => d.uvIndexMax));
  const maxWind = Math.max(...daily.map(d => d.windSpeedMax));

  // Temperature based items
  if (minTemp < 5) {
    checklist.add('Thermal underwear / base layers');
    checklist.add('Heavy insulated jacket or down coat');
    checklist.add('Fleece-lined beanie & wool scarf');
    checklist.add('Insulated thermal gloves');
  } else if (minTemp < 15) {
    checklist.add('Medium knit sweaters or cardigans');
    checklist.add('Versatile windproof jacket');
  }

  if (maxTemp > 25) {
    checklist.add('Lightweight cotton or linen shirts');
    checklist.add('Comfortable walking shorts or breezy pants');
    checklist.add('Reusable insulated water bottle');
  }

  // Rain based items
  if (maxRainProb > 30) {
    checklist.add('Compact windproof travel umbrella');
    checklist.add('Water-resistant footwear or leather boots');
  }
  if (maxRainProb > 60) {
    checklist.add('Waterproof packable rain shell (DWR coated)');
  }

  // Sun & UV
  if (maxUV >= 3) {
    checklist.add('UV400 protective sunglasses');
    checklist.add('Broad-spectrum SPF 30+ or 50+ sunscreen');
  }
  if (maxUV >= 6) {
    checklist.add('Wide-brimmed sun hat or cap');
    checklist.add('Hydrating lip balm with SPF');
  }

  // Wind
  if (maxWind > 30) {
    checklist.add('Wind-blocking outer layer');
  }

  // Universal baseline
  checklist.add('Multi-port universal travel adapter');
  checklist.add('Comfortable broken-in walking sneakers');

  return Array.from(checklist);
}
