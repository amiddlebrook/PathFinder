import React, { useState, useEffect } from 'react';
import { CloudSunIcon, SearchIcon, SunIcon, CloudIcon, CloudRainIcon, WindIcon } from './icons';
import { getWeatherForLocation, LiveWeatherData } from '../services/geminiService';

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const WeatherIcon: React.FC<{ condition: string, className?: string }> = ({ condition, className }) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) {
        return <SunIcon className={className} />;
    }
    if (lowerCondition.includes('rain') || lowerCondition.includes('shower') || lowerCondition.includes('drizzle')) {
        return <CloudRainIcon className={className} />;
    }
     if (lowerCondition.includes('wind')) {
        return <WindIcon className={className} />;
    }
    if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
        return <CloudIcon className={className} />;
    }
    return <CloudSunIcon className={className} />;
}

const Weather: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('Yosemite National Park');
    const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = async (location: string) => {
        if (!location) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getWeatherForLocation(location);
            setWeatherData(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred');
            setWeatherData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather('Yosemite National Park');
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        fetchWeather(searchQuery);
    };

    return (
        <div className="h-full flex flex-col bg-[var(--color-bg-secondary)]">
            <header className="p-6 border-b border-[var(--color-border)] flex-shrink-0">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <CloudSunIcon className="w-8 h-8 text-[var(--color-accent)]" />
                        <div>
                            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Weather Center</h2>
                            <p className="text-[var(--color-text-secondary)]">Get live forecasts powered by AI.</p>
                        </div>
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search location..."
                            className="w-full sm:w-64 bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none transition"
                        />
                         <button type="submit" disabled={isLoading} className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold p-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-11 h-11 flex-shrink-0">
                            {isLoading ? <LoadingSpinner /> : <SearchIcon className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto p-6">
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)] mx-auto"></div>
                            <p className="mt-3 text-[var(--color-text-secondary)]">Fetching live weather data...</p>
                        </div>
                    </div>
                )}
                {error && (
                     <div className="text-center py-16">
                        <p className="text-red-400">Error: {error}</p>
                        <p className="text-[var(--color-text-secondary)] mt-1">Please try a different location or check your connection.</p>
                    </div>
                )}
                {!isLoading && weatherData && (
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">7-Day Forecast for <span className="text-[var(--color-accent)]">{weatherData.locationName}</span></h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                            {weatherData.daily.map(day => (
                                <div key={day.day} className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg text-center border border-[var(--color-border-subtle)]">
                                    <p className="font-bold text-lg text-[var(--color-text-primary)]">{day.day}</p>
                                    <div className="text-4xl my-2 text-yellow-300 flex justify-center"><WeatherIcon condition={day.condition} className="w-12 h-12"/></div>
                                    <p className="text-xl font-semibold text-[var(--color-text-primary)]">{day.high_f}°</p>
                                    <p className="text-[var(--color-text-secondary)]">{day.low_f}°</p>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Hourly Forecast</h3>
                         <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg border border-[var(--color-border-subtle)]">
                            <div className="flex overflow-x-auto space-x-6 pb-2">
                                {weatherData.hourly.map(hour => (
                                    <div key={hour.time} className="flex-shrink-0 w-20 text-center">
                                        <p className="text-sm text-[var(--color-text-secondary)]">{hour.time}</p>
                                        <div className="text-3xl my-1 text-yellow-300 flex justify-center"><WeatherIcon condition={hour.condition} className="w-10 h-10"/></div>
                                        <p className="font-bold text-[var(--color-text-primary)] text-lg">{hour.temp_f}°</p>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Weather;