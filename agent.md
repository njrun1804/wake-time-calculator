# Wake Time Calculator - Agent Documentation

## Overview
Single-file HTML app that calculates optimal wake time based on meeting schedule, run duration, and location-aware weather conditions.

## Key Features

### Core Calculator
- **Fixed prep time**: 45 minutes (non-configurable)
- **Inputs**: First meeting time, run duration, breakfast time, travel time, run location
- **Output**: Wake time (12/24hr format), run start time, breakdown of time components
- **Previous day badge**: Shows when wake time crosses midnight

### Weather Awareness Bar
- **Dawn time**: From SunriseSunset.io API
- **Weather data**: Open-Meteo API (temp, humidity, wind, precipitation)
- **Trail Wetness Score**: Custom algorithm using:
  - 7-day precipitation history with 0.85 daily decay factor
  - ET₀ (evapotranspiration) subtraction at 60% rate
  - Categories: Dry (<0.05"), Moist, Slick, Muddy, Soaked (>0.8")
- **Wind chill**: NWS formula when temp ≤50°F and wind ≥3mph
- **Wet bulb**: Direct from API or Stull approximation fallback

### Data Management
- **LocalStorage keys**:
  - `wake:first` - First meeting time
  - `wake:run` - Run duration
  - `wake:travel` - Travel time  
  - `wake:breakfast` - Breakfast duration
  - `wake:location` - Selected run location
  - `wake:lat`, `wake:lon`, `wake:city` - Location coordinates
- **Caching**: 15-minute cache for API responses (localStorage + in-memory)
- **Request deduplication**: Uses request ID counter to prevent stale updates

## Technical Details

### API Endpoints
- **Dawn**: `https://api.sunrisesunset.io/json?lat={lat}&lng={lon}&date=tomorrow`
- **Weather**: `https://api.open-meteo.com/v1/forecast` (hourly + daily data)
- **Geocoding**: `https://geocoding-api.open-meteo.com/v1/search` (forward)
- **Reverse geocoding**: `https://geocoding-api.open-meteo.com/v1/reverse`

### Units
- **Temperature**: Fahrenheit
- **Wind**: mph
- **Precipitation**: inches
- **ET₀**: mm (converted to inches internally)

### Key Algorithms

#### Trail Wetness Score
```javascript
wetness = Σ(i=0 to n-1) [max(0, rain[i] - 0.6*ET₀[i]) * 0.85^i]
```
Where i=0 is yesterday, going back n days (default 7)

#### Wind Chill (NWS)
```javascript
if (tempF <= 50 && windMph >= 3):
  windChill = 35.74 + 0.6215*T - 35.75*V^0.16 + 0.4275*T*V^0.16
```

### UI/UX Features
- **Responsive design**: Mobile-first with breakpoints at 640px, 520px, 480px
- **Live recalculation**: Form changes update immediately
- **Location auto-sync**: Travel time updates when location changes (if not manually set)
- **Ellipsis truncation**: Long location names truncate with tooltip
- **ARIA labels**: Screen reader support on key elements

## Common Tasks

### Adding a new run location
Add to the appropriate `<optgroup>` in the location select:
```html
<option value="location-id" data-travel="minutes">Location Name</option>
```

### Adjusting wetness thresholds
Modify the `categorizeWetness` function breakpoints (currently 0.05, 0.20, 0.40, 0.80 inches)

### Changing cache duration
Update `CACHE_DURATION` constant (currently 15 minutes = 900000ms)

## Recent Improvements
- Fixed date label to use dawn's actual date (not "now + 24h")
- Added request ID tracking to prevent stale responses
- Implemented full localStorage caching alongside in-memory cache
- Display numeric wetness value alongside category
- Reverse geocoding for "Use my location" to show city name
- Streamlined UI: removed date display, updated header format, removed footer

## Testing Checklist
- [ ] Calculator works across midnight boundary
- [ ] Weather loads for both geolocation and manual city entry
- [ ] Wetness score updates with location change
- [ ] Cache prevents excessive API calls
- [ ] Mobile layout remains functional
- [ ] Settings persist after reload
- [ ] Travel time syncs with location selection