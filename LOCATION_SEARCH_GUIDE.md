# Machakos Location Search System

## Overview
An efficient, robust location search system for waste reporting in Machakos, Kenya. The system provides:

- **Machakos-biased geocoding** - All searches automatically bias to Machakos, Kenya
- **Autocomplete suggestions** - Real-time suggestions as users type
- **Comprehensive local database** - 30+ hardcoded Machakos locations including landmarks, healthcare, education, and transport
- **Graceful error handling** - User-friendly error messages with fallback options
- **Console logging** - Detailed debugging logs for development and troubleshooting

## Features

### 1. Location Database
The system includes 30+ pre-loaded locations in Machakos:

**City Centers:**
- Machakos Town (main)
- Machakos Kenyatta Stadium
- Machakos County Headquarters
- Machakos Central Business District
- Machakos Market
- Machakos City Mall

**Surrounding Areas:**
- Athi River
- Mlolongo
- Syokimau
- Katangi
- Tala
- Kangundo
- Mwala
- Matuu
- And more...

**Healthcare Facilities:**
- Machakos Level 5 Hospital
- Machakos Medical Centre
- St. Joseph's Hospital Machakos

**Educational Institutions:**
- Machakos University
- Machakos Teachers Training College
- Machakos School

**Landmarks & Recreation:**
- Fourteen Falls
- Machakos Cooling Towers
- Kenya National Park Station
- Machakos Game Sanctuary

### 2. Geocoding with Machakos Bias
```javascript
// Automatic bias to Machakos, Kenya
const result = await geocodeLocation("Athi River");
// Returns coordinates within Machakos bounds
```

The system:
- First checks the local Machakos database
- Then queries Nominatim OpenStreetMap API with Machakos bias
- Filters results to stay within Machakos county boundaries
- Falls back to default location if all else fails

### 3. Autocomplete Suggestions
```javascript
// Get suggestions as user types
const suggestions = getAutocompleteSuggestions("Mach");
// Returns: [Machakos Town, Machakos Hospital, etc.]
```

Features:
- Prioritizes exact/starts-with matches over partial matches
- Shows up to 8 suggestions
- Icons indicate landmark (📍) vs area (🗺️) types
- Interactive dropdown in ReportIssue form

### 4. Error Handling
Graceful error scenarios:

| Scenario | Handling |
|----------|----------|
| Location not found | Shows: "Location not found, try another nearby area" + dropdown suggestions |
| Network error | Shows: "Network issue, please try again" |
| Geolocation denied | Uses Machakos Town default location |
| Location outside Machakos | Shows warning, allows user to search within Machakos |

### 5. Console Logging
All operations are logged with `[LocationService]` prefix:
```
[LocationService] Geocoding query: Athi River
[LocationService] Found local match: {name: "Athi River", lat: ..., lng: ...}
[LocationService] Location successfully geocoded: {address: "...", source: "local-machakos"}
```

## File Structure

### `/frontend/src/services/locationService.js`
Main location service with all geocoding, reverse geocoding, and suggestion logic.

**Exported Functions:**
```javascript
geocodeLocation(query)              // Main geocoding
reverseGeocode(lat, lng)           // Convert coordinates to address
getAutocompleteSuggestions(query)  // Get suggestions as user types
getDefaultLocation()               // Get fallback Machakos location
getAllMachakosCentralLocations()   // Get all Machakos locations
isNearMachakos(lat, lng)          // Validate coordinates
```

### `/frontend/src/pages/citizen/ReportIssue.jsx`
Updated component using the location service:
- Interactive location input with dropdown
- Real-time autocomplete as user types
- Geocoding feedback (searching, success, error)
- Console logging for debugging
- Improved error messages

## Usage Example

### In ReportIssue Component
```javascript
import {
  geocodeLocation,
  getAutocompleteSuggestions,
  getDefaultLocation,
} from "../../services/locationService";

// Get suggestions
const suggestions = getAutocompleteSuggestions(userInput);

// Geocode a location
const result = await geocodeLocation("Machakos Town");
// Returns: { lat: -1.5177, lng: 37.2634, address: "...", source: "local-machakos" }

// Use default if needed
const defaultLoc = getDefaultLocation();
```

## Debugging

### Console Output
All operations log to console with `[LocationService]` or `[ReportIssue]` prefix:

```javascript
// Enable browser DevTools console to see:
[LocationService] Geocoding query: Athi River
[LocationService] Found local match: {name: "Athi River", lat: -1.4812, lng: 37.0748}
[ReportIssue] Location successfully geocoded: {...}
```

### Common Issues

1. **"Location not found, try another nearby area"**
   - Location is not in the database and Nominatim returns no results
   - User should try a nearby area from suggestions

2. **"Network issue, please try again"**
   - API connection failed (Nominatim servers unreachable)
   - System still works with local database

3. **"Location outside Machakos"**
   - User's device reported coordinates outside Machakos bounds
   - Default Machakos Town location used automatically

## API Integration

The system uses **Nominatim (OpenStreetMap)** for reverse geocoding and extended searches:
- No API key required
- Free tier supports reasonable request rates
- User-Agent: "EcoTrack-Machakos-App/1.0"

## Performance

- **Local lookups**: Instant (<5ms)
- **Nominatim queries**: ~200-500ms
- **Suggestions**: Instant (<1ms)
- **Duplicate prevention**: Suggestions already found locally aren't queried via API

## Adding New Locations

To add more Machakos locations, edit `locationService.js`:

```javascript
const MACHAKOS_LOCATIONS = {
  // Existing...
  "Your New Location": {
    lat: -1.5234,
    lng: 37.2890,
    accuracy: "landmark" // "city", "area", or "landmark"
  }
};
```

## Future Enhancements

- [ ] Replace Nominatim with Google Maps/Mapbox for better coverage
- [ ] Add "Browse Map" option to select location visually
- [ ] Save favorite locations for quick access
- [ ] Integration with actual Machakos street data
- [ ] Multi-language support
- [ ] Radius-based search around current location

## Testing

### Test Cases
1. Search for partial names (e.g., "Athi")
2. Search for exact names (e.g., "Machakos Town")
3. Try offline (should use local database)
4. Try location outside Machakos
5. Deny geolocation permission
6. Try invalid input

### Expected Behavior
- All searches return Machakos-specific results
- Autocomplete shows relevant suggestions
- API failures don't break functionality
- Default location used as fallback
- Console shows detailed logs
