import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics.entity';

// City coordinates database (approximate)
const cityCoordinates = {
  // Bangladesh
  'Dhaka': { lat: 23.8103, lng: 90.4125 },
  'Chittagong': { lat: 22.3569, lng: 91.7832 },
  'Sylhet': { lat: 24.8949, lng: 91.8687 },
  'Khulna': { lat: 22.8456, lng: 89.5403 },
  'Rajshahi': { lat: 24.3636, lng: 88.6241 },
  'Barisal': { lat: 22.7010, lng: 90.3535 },
  'Rangpur': { lat: 25.7439, lng: 89.2752 },
  'Mymensingh': { lat: 24.7471, lng: 90.4203 },
  'Comilla': { lat: 23.4607, lng: 91.1809 },
  'Narayanganj': { lat: 23.6166, lng: 90.5033 },

  // India
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Kolkata': { lat: 22.5726, lng: 88.3639 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'Jaipur': { lat: 26.9124, lng: 75.7873 },
  'Lucknow': { lat: 26.8467, lng: 80.9462 },

  // USA
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Philadelphia': { lat: 39.9526, lng: -75.1652 },
  'San Antonio': { lat: 29.4241, lng: -98.4936 },
  'San Diego': { lat: 32.7157, lng: -117.1611 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'San Jose': { lat: 37.3382, lng: -121.8863 },

  // UK
  'London': { lat: 51.5074, lng: -0.1278 },
  'Manchester': { lat: 53.4808, lng: -2.2426 },
  'Birmingham': { lat: 52.4862, lng: -1.8904 },
  'Liverpool': { lat: 53.4084, lng: -2.9916 },
  'Leeds': { lat: 53.8008, lng: -1.5491 },

  // Germany
  'Berlin': { lat: 52.5200, lng: 13.4050 },
  'Munich': { lat: 48.1351, lng: 11.5820 },
  'Hamburg': { lat: 53.5511, lng: 9.9937 },
  'Frankfurt': { lat: 50.1109, lng: 8.6821 },

  // France
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'Lyon': { lat: 45.7640, lng: 4.8357 },
  'Marseille': { lat: 43.2965, lng: 5.3698 },

  // Canada
  'Toronto': { lat: 43.6510, lng: -79.3470 },
  'Vancouver': { lat: 49.2827, lng: -123.1207 },
  'Montreal': { lat: 45.5017, lng: -73.5673 },

  // Australia
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Melbourne': { lat: -37.8136, lng: 144.9631 },
  'Brisbane': { lat: -27.4698, lng: 153.0251 },
  'Perth': { lat: -31.9505, lng: 115.8605 },
};

// Country centers (fallback)
const countryCenters = {
  'Afghanistan': { lat: 33.9391, lng: 67.7100 },
  'Albania': { lat: 41.1533, lng: 20.1683 },
  'Algeria': { lat: 28.0339, lng: 1.6596 },
  'Andorra': { lat: 42.5462, lng: 1.6016 },
  'Angola': { lat: -11.2027, lng: 17.8739 },
  'Antigua and Barbuda': { lat: 17.0608, lng: -61.7964 },
  'Argentina': { lat: -38.4161, lng: -63.6167 },
  'Armenia': { lat: 40.0691, lng: 45.0382 },
  'Australia': { lat: -25.2744, lng: 133.7751 },
  'Austria': { lat: 47.5162, lng: 14.5501 },
  'Azerbaijan': { lat: 40.1431, lng: 47.5769 },
  'Bahamas': { lat: 25.0343, lng: -77.3963 },
  'Bahrain': { lat: 26.0667, lng: 50.5577 },
  'Bangladesh': { lat: 23.6850, lng: 90.3563 },
  'Barbados': { lat: 13.1939, lng: -59.5432 },
  'Belarus': { lat: 53.7098, lng: 27.9534 },
  'Belgium': { lat: 50.8503, lng: 4.3517 },
  'Belize': { lat: 17.1899, lng: -88.4976 },
  'Benin': { lat: 9.3077, lng: 2.3158 },
  'Bhutan': { lat: 27.5142, lng: 90.4336 },
  'Bolivia': { lat: -16.2902, lng: -63.5887 },
  'Bosnia and Herzegovina': { lat: 43.9159, lng: 17.6791 },
  'Botswana': { lat: -22.3285, lng: 24.6849 },
  'Brazil': { lat: -14.2350, lng: -51.9253 },
  'Brunei': { lat: 4.5353, lng: 114.7277 },
  'Bulgaria': { lat: 42.7339, lng: 25.4858 },
  'Burkina Faso': { lat: 12.2383, lng: -1.5616 },
  'Burundi': { lat: -3.3731, lng: 29.9189 },
  'Cabo Verde': { lat: 16.0021, lng: -24.0132 },
  'Cambodia': { lat: 12.5657, lng: 104.9910 },
  'Cameroon': { lat: 7.3697, lng: 12.3547 },
  'Canada': { lat: 56.1304, lng: -106.3468 },
  'Central African Republic': { lat: 6.6111, lng: 20.9394 },
  'Chad': { lat: 15.4542, lng: 18.7322 },
  'Chile': { lat: -35.6751, lng: -71.5430 },
  'China': { lat: 35.8617, lng: 104.1954 },
  'Colombia': { lat: 4.5709, lng: -74.2973 },
  'Comoros': { lat: -11.6455, lng: 43.3333 },
  'Congo (Brazzaville)': { lat: -0.2280, lng: 15.8277 },
  'Congo (Kinshasa)': { lat: -4.0383, lng: 21.7587 },
  'Costa Rica': { lat: 9.7489, lng: -83.7534 },
  'Croatia': { lat: 45.1000, lng: 15.2000 },
  'Cuba': { lat: 21.5218, lng: -77.7812 },
  'Cyprus': { lat: 35.1264, lng: 33.4299 },
  'Czech Republic': { lat: 49.8175, lng: 15.4730 },
  'Denmark': { lat: 56.2639, lng: 9.5018 },
  'Djibouti': { lat: 11.8251, lng: 42.5903 },
  'Dominica': { lat: 15.4140, lng: -61.3700 },
  'Dominican Republic': { lat: 18.7357, lng: -70.1627 },
  'East Timor': { lat: -8.8742, lng: 125.7275 },
  'Ecuador': { lat: -1.8312, lng: -78.1834 },
  'Egypt': { lat: 26.8206, lng: 30.8025 },
  'El Salvador': { lat: 13.7942, lng: -88.8965 },
  'Equatorial Guinea': { lat: 1.6508, lng: 10.2679 },
  'Eritrea': { lat: 15.1794, lng: 39.7823 },
  'Estonia': { lat: 58.5953, lng: 25.0136 },
  'Eswatini': { lat: -26.5225, lng: 31.4659 },
  'Ethiopia': { lat: 9.1450, lng: 40.4897 },
  'Fiji': { lat: -17.7134, lng: 178.0650 },
  'Finland': { lat: 61.9241, lng: 25.7482 },
  'France': { lat: 46.2276, lng: 2.2137 },
  'Gabon': { lat: -0.8037, lng: 11.6094 },
  'Gambia': { lat: 13.4432, lng: -15.3101 },
  'Georgia': { lat: 42.3154, lng: 43.3569 },
  'Germany': { lat: 51.1657, lng: 10.4515 },
  'Ghana': { lat: 7.9465, lng: -1.0232 },
  'Greece': { lat: 39.0742, lng: 21.8243 },
  'Grenada': { lat: 12.2628, lng: -61.6042 },
  'Guatemala': { lat: 15.7835, lng: -90.2308 },
  'Guinea': { lat: 9.9456, lng: -9.6966 },
  'Guinea-Bissau': { lat: 11.8037, lng: -15.1804 },
  'Guyana': { lat: 4.8604, lng: -58.9302 },
  'Haiti': { lat: 18.9712, lng: -72.2852 },
  'Honduras': { lat: 15.199999, lng: -86.2419 },
  'Hungary': { lat: 47.1625, lng: 19.5033 },
  'Iceland': { lat: 64.9631, lng: -19.0208 },
  'India': { lat: 20.5937, lng: 78.9629 },
  'Indonesia': { lat: -0.7893, lng: 113.9213 },
  'Iran': { lat: 32.4279, lng: 53.6880 },
  'Iraq': { lat: 33.2232, lng: 43.6793 },
  'Ireland': { lat: 53.4129, lng: -8.2439 },
  'Israel': { lat: 31.0461, lng: 34.8516 },
  'Italy': { lat: 41.8719, lng: 12.5674 },
  'Jamaica': { lat: 18.1096, lng: -77.2975 },
  'Japan': { lat: 36.2048, lng: 138.2529 },
  'Jordan': { lat: 30.5852, lng: 36.2384 },
  'Kazakhstan': { lat: 48.0196, lng: 66.9237 },
  'Kenya': { lat: -1.2921, lng: 36.8219 },
  'Kiribati': { lat: -3.3704, lng: -168.7340 },
  'Kuwait': { lat: 29.3759, lng: 47.9774 },
  'Kyrgyzstan': { lat: 41.2044, lng: 74.7661 },
  'Laos': { lat: 19.8563, lng: 102.4955 },
  'Latvia': { lat: 56.8796, lng: 24.6032 },
  'Lebanon': { lat: 33.8547, lng: 35.8623 },
  'Lesotho': { lat: -29.6099, lng: 28.2336 },
  'Liberia': { lat: 6.4281, lng: -9.4295 },
  'Libya': { lat: 26.3351, lng: 17.2283 },
  'Liechtenstein': { lat: 47.1660, lng: 9.5554 },
  'Lithuania': { lat: 55.1694, lng: 23.8813 },
  'Luxembourg': { lat: 49.8153, lng: 6.1296 },
  'Madagascar': { lat: -18.7669, lng: 46.8692 },
  'Malawi': { lat: -13.2543, lng: 34.3015 },
  'Malaysia': { lat: 4.2105, lng: 101.9758 },
  'Maldives': { lat: 3.2028, lng: 73.2207 },
  'Mali': { lat: 17.5707, lng: -3.9962 },
  'Malta': { lat: 35.9375, lng: 14.3754 },
  'Marshall Islands': { lat: 7.1315, lng: 171.1845 },
  'Mauritania': { lat: 21.0079, lng: -10.9408 },
  'Mauritius': { lat: -20.3484, lng: 57.5522 },
  'Mexico': { lat: 23.6345, lng: -102.5528 },
  'Micronesia': { lat: 7.4256, lng: 150.5508 },
  'Moldova': { lat: 47.4116, lng: 28.3699 },
  'Monaco': { lat: 43.7384, lng: 7.4246 },
  'Mongolia': { lat: 46.8625, lng: 103.8467 },
  'Montenegro': { lat: 42.7087, lng: 19.3744 },
  'Morocco': { lat: 31.7917, lng: -7.0926 },
  'Mozambique': { lat: -18.6657, lng: 35.5296 },
  'Myanmar': { lat: 21.9162, lng: 95.9560 },
  'Namibia': { lat: -22.9576, lng: 18.4904 },
  'Nauru': { lat: -0.5228, lng: 166.9315 },
  'Nepal': { lat: 28.3949, lng: 84.1240 },
  'Netherlands': { lat: 52.1326, lng: 5.2913 },
  'New Zealand': { lat: -40.9006, lng: 174.8860 },
  'Nicaragua': { lat: 12.8654, lng: -85.2072 },
  'Niger': { lat: 17.6078, lng: 8.0817 },
  'Nigeria': { lat: 9.0820, lng: 8.6753 },
  'North Korea': { lat: 40.3399, lng: 127.5101 },
  'North Macedonia': { lat: 41.6086, lng: 21.7453 },
  'Norway': { lat: 60.4720, lng: 8.4689 },
  'Oman': { lat: 21.5126, lng: 55.9233 },
  'Pakistan': { lat: 30.3753, lng: 69.3451 },
  'Palau': { lat: 7.5149, lng: 134.5825 },
  'Palestine': { lat: 31.9466, lng: 35.3027 },
  'Panama': { lat: 8.5379, lng: -80.7821 },
  'Papua New Guinea': { lat: -6.3149, lng: 143.9555 },
  'Paraguay': { lat: -23.4425, lng: -58.4438 },
  'Peru': { lat: -9.1899, lng: -75.0152 },
  'Philippines': { lat: 12.8797, lng: 121.7740 },
  'Poland': { lat: 51.9194, lng: 19.1451 },
  'Portugal': { lat: 39.3999, lng: -8.2245 },
  'Qatar': { lat: 25.3548, lng: 51.1839 },
  'Romania': { lat: 45.9432, lng: 24.9668 },
  'Russia': { lat: 61.5240, lng: 105.3188 },
  'Rwanda': { lat: -1.9403, lng: 29.8739 },
  'Saint Kitts and Nevis': { lat: 17.3578, lng: -62.7830 },
  'Saint Lucia': { lat: 13.9094, lng: -60.9789 },
  'Saint Vincent and the Grenadines': { lat: 12.9843, lng: -61.2872 },
  'Samoa': { lat: -13.7590, lng: -172.1046 },
  'San Marino': { lat: 43.9336, lng: 12.4578 },
  'Sao Tome and Principe': { lat: 0.1864, lng: 6.6131 },
  'Saudi Arabia': { lat: 23.8859, lng: 45.0792 },
  'Senegal': { lat: 14.4974, lng: -14.4524 },
  'Serbia': { lat: 44.0165, lng: 21.0059 },
  'Seychelles': { lat: -4.6796, lng: 55.4920 },
  'Sierra Leone': { lat: 8.4606, lng: -11.7799 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Slovakia': { lat: 48.6690, lng: 19.6990 },
  'Slovenia': { lat: 46.1512, lng: 14.9955 },
  'Solomon Islands': { lat: -9.6457, lng: 160.1562 },
  'Somalia': { lat: 5.1521, lng: 46.1996 },
  'South Africa': { lat: -30.5595, lng: 22.9375 },
  'South Korea': { lat: 35.9078, lng: 127.7669 },
  'South Sudan': { lat: 6.8769, lng: 31.3069 },
  'Spain': { lat: 40.4637, lng: -3.7492 },
  'Sri Lanka': { lat: 7.8731, lng: 80.7718 },
  'Sudan': { lat: 12.8628, lng: 30.2176 },
  'Suriname': { lat: 3.9193, lng: -56.0278 },
  'Sweden': { lat: 60.1282, lng: 18.6435 },
  'Switzerland': { lat: 46.8182, lng: 8.2275 },
  'Syria': { lat: 34.8021, lng: 38.9968 },
  'Taiwan': { lat: 23.6978, lng: 120.9605 },
  'Tajikistan': { lat: 38.8610, lng: 71.2761 },
  'Tanzania': { lat: -6.3690, lng: 34.8888 },
  'Thailand': { lat: 15.8700, lng: 100.9925 },
  'Togo': { lat: 8.6195, lng: 0.8248 },
  'Tonga': { lat: -21.1789, lng: -175.1982 },
  'Trinidad and Tobago': { lat: 10.6918, lng: -61.2225 },
  'Tunisia': { lat: 33.8869, lng: 9.5375 },
  'Turkey': { lat: 38.9637, lng: 35.2433 },
  'Turkmenistan': { lat: 38.9697, lng: 59.5563 },
  'Tuvalu': { lat: -7.1095, lng: 179.1946 },
  'Uganda': { lat: 1.3733, lng: 32.2903 },
  'Ukraine': { lat: 48.3794, lng: 31.1656 },
  'United Arab Emirates': { lat: 23.4241, lng: 53.8478 },
  'United Kingdom': { lat: 55.3781, lng: -3.4360 },
  'United States': { lat: 37.0902, lng: -95.7129 },
  'Uruguay': { lat: -32.5228, lng: -55.7658 },
  'Uzbekistan': { lat: 41.3775, lng: 64.5853 },
  'Vanuatu': { lat: -15.3767, lng: 166.9592 },
  'Vatican City': { lat: 41.9029, lng: 12.4534 },
  'Venezuela': { lat: 6.4238, lng: -66.5897 },
  'Vietnam': { lat: 14.0583, lng: 108.2772 },
  'Yemen': { lat: 15.5527, lng: 48.5164 },
  'Zambia': { lat: -13.1339, lng: 27.8493 },
  'Zimbabwe': { lat: -19.0154, lng: 29.1549 },
};

// Cache for generated offsets to keep consistent between requests
const offsetCache = new Map();

@Injectable()
export class GeoLocationService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private analyticsRepository: Repository<AnalyticsEvent>,
  ) { }

  // Generate consistent offset for a city based on its name
  private getCityOffset(city: string, country: string): { lat: number; lng: number } {
    const key = `${country}-${city}`;

    if (offsetCache.has(key)) {
      return offsetCache.get(key);
    }

    // Generate deterministic offset based on city name hash
    const hash = this.hashCode(city + country);
    const latOffset = (hash % 200) / 100.0 - 1.0; // -1 to +1 degree
    const lngOffset = ((hash * 31) % 200) / 100.0 - 1.0; // -1 to +1 degree

    const offset = { lat: latOffset, lng: lngOffset };
    offsetCache.set(key, offset);

    console.log(`📍 Generated offset for ${city}, ${country}:`, offset);
    return offset;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async getUserDistribution(): Promise<any> {
    const distribution = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('country', 'country')
      .addSelect('COUNT(DISTINCT hashed_user_id)', 'user_count')
      .where('country IS NOT NULL')
      .andWhere('hashed_user_id IS NOT NULL')
      .groupBy('country')
      .orderBy('user_count', 'DESC')
      .getRawMany();

    const total = distribution.reduce((sum, item) => sum + parseInt(item.user_count), 0);

    return {
      total,
      distribution: distribution.map(item => ({
        country: item.country || 'Unknown',
        count: parseInt(item.user_count),
        percentage: total > 0 ? ((parseInt(item.user_count) / total) * 100).toFixed(1) : '0',
      })),
    };
  }

  async getActiveSessionsByCountry(): Promise<any> {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    const sessions = await this.analyticsRepository
      .createQueryBuilder('event')
      .select('country', 'country')
      .addSelect('COUNT(DISTINCT hashed_user_id)', 'active_users')
      .where('timestamp > :time', { time: fiveMinAgo })
      .andWhere('country IS NOT NULL')
      .andWhere('hashed_user_id IS NOT NULL')
      .groupBy('country')
      .orderBy('active_users', 'DESC')
      .getRawMany();

    return sessions;
  }

  // UPDATED: City-wise map data with offsets for unknown cities
  async getGeoMapData(): Promise<any[]> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get city-wise data from database
    const locations = await this.analyticsRepository
      .createQueryBuilder('event')
      .select([
        'country',
        'city',
        'COUNT(DISTINCT hashed_user_id) as user_count',
        'COUNT(*) as event_count'
      ])
      .where('timestamp > :time', { time: last24Hours })
      .andWhere('country IS NOT NULL')
      .andWhere('city IS NOT NULL')
      .andWhere('hashed_user_id IS NOT NULL')
      .groupBy('country, city')
      .orderBy('event_count', 'DESC')
      .limit(500)
      .getRawMany();

    console.log(`📍 Found ${locations.length} city locations from database`);

    // Group by country for logging
    const countryGroups = {};
    locations.forEach(loc => {
      if (!countryGroups[loc.country]) {
        countryGroups[loc.country] = [];
      }
      countryGroups[loc.country].push(loc.city);
    });
    console.log('📍 Cities by country:', countryGroups);

    // Add coordinates for each city
    const locationsWithCoords = locations.map(loc => {
      // Try to get city-specific coordinates first
      let coords = cityCoordinates[loc.city];
      let source = 'known';

      // If city not found, use country center with offset
      if (!coords) {
        const countryCenter = countryCenters[loc.country] || { lat: 20.0, lng: 0.0 };
        const offset = this.getCityOffset(loc.city, loc.country);

        coords = {
          lat: countryCenter.lat + offset.lat,
          lng: countryCenter.lng + offset.lng
        };
        source = 'offset';

        console.log(`📍 Generated offset for ${loc.city}, ${loc.country}:`, offset);
      }

      return {
        country: loc.country,
        city: loc.city,
        latitude: coords.lat,
        longitude: coords.lng,
        user_count: parseInt(loc.user_count),
        event_count: parseInt(loc.event_count),
        source: source // For debugging
      };
    });

    console.log(`🗺️ Final map data: ${locationsWithCoords.length} locations`);
    console.log('📍 Sample locations:', locationsWithCoords.slice(0, 3));

    return locationsWithCoords;
  }

  async getTopCities(limit: number = 20): Promise<any[]> {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const cities = await this.analyticsRepository
      .createQueryBuilder('event')
      .select([
        'country',
        'city',
        'COUNT(DISTINCT hashed_user_id) as user_count',
        'COUNT(*) as event_count'
      ])
      .where('timestamp > :time', { time: last30Days })
      .andWhere('country IS NOT NULL')
      .andWhere('city IS NOT NULL')
      .andWhere('hashed_user_id IS NOT NULL')
      .groupBy('country, city')
      .orderBy('user_count', 'DESC')
      .limit(limit)
      .getRawMany();

    return cities;
  }
}