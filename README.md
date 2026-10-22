```text?code_stdout&code_event_index=1
# Weather Intelligence App

A modern React-based Weather Intelligence web application built with AI assistance and deployed on Cloudflare Pages. The app fetches real-time weather data and multi-day forecasts using the public Open-Meteo API.

---

## Features
- **City Search**: Search for weather conditions in any city globally using the Open-Meteo Geocoding API.
- **Current Weather Conditions**: View real-time temperature, wind speed, humidity, and weather conditions.
- **7-Day Forecast**: Visual forecast cards displaying expected weekly temperatures and weather codes.
- **Visual Analytics**: Weather trend charts highlighting temperature changes over time.
- **Smart Recommendations**: Dynamic outfit and travel planning tips based on live weather conditions (e.g., umbrella for rain, sunscreen for heat).
- **Error Handling**: Graceful error UI when a city is not found or when API network calls fail.

---

## APIs Used
- **Open-Meteo Geocoding API**: `https://geocoding-api.open-meteo.com/v1/search`
- **Open-Meteo Forecast API**: `https://api.open-meteo.com/v1/forecast`

---

## Development & AI-Assisted Building

1. **Google AI Studio App Build**:
   - Prompted Google AI Studio to generate the functional Weather Intelligence React single-page application (SPA).
   - Tested core city searches, forecast rendering, chart components, and invalid input states locally in AI Studio.

2. **Direct GitHub Integration**:
   - Connected Google AI Studio directly to GitHub to initialize and push source files to the target repository.

---

## Cloudflare Pages Deployment Steps

1. Log into **Cloudflare Dashboard** and navigate to **Workers & Pages**.
2. Click **Create Application** > **Pages** > **Connect to Git**.
3. Select the connected GitHub repository (`sundartm-sketch/Weather-APP`).
4. Configure the build parameters:
   - **Framework Preset**: `Vite` (or `None`)
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
5. Click **Save and Deploy**.
6. Access the live production web app via the generated Cloudflare Pages URL.

---

## Local Development Setup

To run this project locally:

```bash
# Clone the repository
git clone [https://github.com/sundartm-sketch/Weather-APP.git](https://github.com/sundartm-sketch/Weather-APP.git)
cd Weather-APP

# Install dependencies
npm install

# Start the local development server
npm run dev

# Build for production
npm run build
# Weather Intelligence App

A modern React-based Weather Intelligence web application built with AI assistance and deployed on Cloudflare Pages. The app fetches real-time weather data and multi-day forecasts using the public Open-Meteo API.

---

## Features
- **City Search**: Search for weather conditions in any city globally using the Open-Meteo Geocoding API.
- **Current Weather Conditions**: View real-time temperature, wind speed, humidity, and weather conditions.
- **7-Day Forecast**: Visual forecast cards displaying expected weekly temperatures and weather codes.
- **Visual Analytics**: Weather trend charts highlighting temperature changes over time.
- **Smart Recommendations**: Dynamic outfit and travel planning tips based on live weather conditions (e.g., umbrella for rain, sunscreen for heat).
- **Error Handling**: Graceful error UI when a city is not found or when API network calls fail.

---

## APIs Used
- **Open-Meteo Geocoding API**: `https://geocoding-api.open-meteo.com/v1/search`
- **Open-Meteo Forecast API**: `https://api.open-meteo.com/v1/forecast`

---

## Development & AI-Assisted Building

1. **Google AI Studio App Build**:
   - Prompted Google AI Studio to generate the functional Weather Intelligence React single-page application (SPA).
   - Tested core city searches, forecast rendering, chart components, and invalid input states locally in AI Studio.

2. **Direct GitHub Integration**:
   - Connected Google AI Studio directly to GitHub to initialize and push source files to the target repository (`sundartm-sketch/Weather-APP`).

---

## Cloudflare Pages Deployment Steps

1. Log into **Cloudflare Dashboard** and navigate to **Workers & Pages**.
2. Click **Create Application** > **Pages** > **Connect to Git**.
3. Select the connected GitHub repository (`sundartm-sketch/Weather-APP`).
4. Configure the build parameters:
   - **Framework Preset**: `Vite` (or `None`)
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
5. Click **Save and Deploy**.
6. Access the live production web app via the generated Cloudflare Pages URL: `https://weather-app.sundar-meenakshi.workers.dev`

---

## Local Development Setup

To run this project locally:

```bash
# Clone the repository
git clone [https://github.com/sundartm-sketch/Weather-APP.git](https://github.com/sundartm-sketch/Weather-APP.git)
cd Weather-APP

# Install dependencies
npm install

# Start the local development server
npm run dev

# Build for production
npm run build
### How to update it on GitHub:
1. Go to your GitHub repository: `[https://github.com/sundartm-sketch/Weather-APP](https://github.com/sundartm-sketch/Weather-APP)`[cite: 5].
2. Click on the **`README.md`** file[cite: 2].
3. Click the pencil icon (**Edit this file**)[cite: 2].
4. Paste the text above, scroll down, and click **Commit changes**[cite: 2].
5. Take a screenshot of the updated `README.md` page on GitHub to save as `README_Instructions.png` for your submission evidence[cite: 1, 2, 4].
