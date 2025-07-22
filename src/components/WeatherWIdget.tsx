import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye, Gauge } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  condition: 'cerah' | 'berawan' | 'hujan' | 'berangin' | 'badai' | 'berkabut';
  description: string;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const WEATHER_API_KEY = 'a3964d8965bb4d1cade41726252207'; // Ganti dengan API key kamu sendiri
  const LOCATION = 'Karawang';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${LOCATION}&aqi=no`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        let condition: WeatherData['condition'] = 'cerah';
        const apiConditionText = data.current.condition.text.toLowerCase();

        if (apiConditionText.includes('sunny') || apiConditionText.includes('clear')) {
          condition = 'cerah';
        } else if (apiConditionText.includes('cloudy') || apiConditionText.includes('overcast')) {
          condition = 'berawan';
        } else if (apiConditionText.includes('rain') || apiConditionText.includes('drizzle') || apiConditionText.includes('shower')) {
          condition = 'hujan';
        } else if (apiConditionText.includes('wind')) {
          condition = 'berangin';
        } else if (apiConditionText.includes('storm') || apiConditionText.includes('thunder')) {
          condition = 'badai';
        } else if (apiConditionText.includes('fog') || apiConditionText.includes('mist')) {
          condition = 'berkabut';
        }

        setWeather({
          temperature: data.current.temp_c,
          humidity: data.current.humidity,
          windSpeed: data.current.wind_kph,
          visibility: data.current.vis_km,
          pressure: data.current.pressure_mb,
          condition,
          description: data.current.condition.text,
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching weather data:', err);
        setError(`Gagal memuat cuaca: ${err.message}.`);
        setLoading(false);
        setWeather(null);
      }
    };

    fetchWeatherData();
    const weatherUpdateInterval = setInterval(fetchWeatherData, 10 * 60 * 1000); // update per 10 menit

    return () => {
      clearInterval(timer);
      clearInterval(weatherUpdateInterval);
    };
  }, []);

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="w-8 h-8 text-gray-400" />;

    switch (weather.condition) {
      case 'cerah':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'berawan':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'hujan':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'berangin':
        return <Wind className="w-8 h-8 text-teal-500" />;
      case 'badai':
        return <CloudRain className="w-8 h-8 text-indigo-700" />;
      case 'berkabut':
        return <Cloud className="w-8 h-8 text-gray-400" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg border border-blue-200 flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-gray-700">Memuat cuaca...</p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg border border-red-300 text-center h-48 flex flex-col justify-center">
        <p className="text-red-700 font-semibold mb-2">Error Cuaca:</p>
        <p className="text-sm text-red-600">{error || 'Data tidak tersedia.'}</p>
        <p className="text-xs text-gray-500 mt-2">Cek koneksi internet atau API Key.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Cuaca {LOCATION}</h3>
          <p className="text-sm text-gray-600">
            {currentTime.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-sm text-gray-600">{currentTime.toLocaleTimeString('id-ID')}</p>
        </div>
        {getWeatherIcon()}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{Math.round(weather.temperature)}°C</p>
              <p className="text-xs text-gray-600">Suhu</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center space-x-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{Math.round(weather.humidity)}%</p>
              <p className="text-xs text-gray-600">Kelembaban</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <Wind className="w-4 h-4 text-teal-500 mx-auto mb-1" />
          <p className="text-xs font-medium">{Math.round(weather.windSpeed)} km/h</p>
          <p className="text-xs text-gray-600">Angin</p>
        </div>
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <Eye className="w-4 h-4 text-purple-500 mx-auto mb-1" />
          <p className="text-xs font-medium">{weather.visibility} km</p>
          <p className="text-xs text-gray-600">Jarak Pandang</p>
        </div>
        <div className="bg-white/50 rounded-lg p-2 text-center">
          <Gauge className="w-4 h-4 text-orange-500 mx-auto mb-1" />
          <p className="text-xs font-medium">{weather.pressure}</p>
          <p className="text-xs text-gray-600">Tekanan</p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-700 font-medium">{weather.description}</p>
        {weather.temperature > 30 && <p className="text-xs text-gray-500 mt-1">Cuaca cukup panas, disarankan minum yang cukup!</p>}
        {weather.condition === 'hujan' && <p className="text-xs text-gray-500 mt-1">Sedia payung sebelum hujan.</p>}
        {weather.condition === 'cerah' && <p className="text-xs text-gray-500 mt-1">Cocok untuk aktivitas outdoor.</p>}
      </div>
    </div>
  );
};

export default WeatherWidget;
