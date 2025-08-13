
import { GoogleGenAI, Type } from "@google/genai";
import { Trip, RiskAssessmentData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// --- Existing Risk Assessment Functionality ---
const riskAssessmentSchema = {
  type: Type.OBJECT,
  properties: {
    trailDifficulty: {
      type: Type.OBJECT,
      properties: {
        rating: { type: Type.STRING, description: "A one-word difficulty rating (e.g., Easy, Moderate, Strenuous, Extreme)." },
        analysis: { type: Type.STRING, description: "A brief analysis of the trail's difficulty, considering factors like elevation, length, and terrain." },
      },
      required: ["rating", "analysis"],
    },
    weatherAnalysis: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A summary of typical weather conditions for the location and dates provided." },
        recommendation: { type: Type.STRING, description: "Recommendations based on the weather analysis (e.g., 'Pack rain gear', 'Be aware of afternoon thunderstorms')." },
      },
      required: ["summary", "recommendation"],
    },
    potentialHazards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hazard: { type: Type.STRING, description: "A potential hazard (e.g., 'Wildlife Encounters', 'Dehydration', 'River Crossings')." },
          mitigation: { type: Type.STRING, description: "A brief suggestion on how to mitigate this specific hazard." },
        },
        required: ["hazard", "mitigation"],
      },
    },
    recommendedGear: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of specific, essential gear recommendations beyond a standard kit, based on the analysis.",
    },
    location: {
      type: Type.OBJECT,
      description: "The geographic center of the destination.",
      properties: {
        lat: { type: Type.NUMBER, description: "Latitude in decimal degrees." },
        lng: { type: Type.NUMBER, description: "Longitude in decimal degrees." },
      },
      required: ["lat", "lng"],
    },
  },
  required: ["trailDifficulty", "weatherAnalysis", "potentialHazards", "recommendedGear", "location"],
};

export const generateRiskAssessment = async (trip: Trip): Promise<RiskAssessmentData> => {
  const prompt = `Analyze the risks for the following outdoor trip: Destination: ${trip.destination}, Dates: ${trip.startDate} to ${trip.endDate}. Act as an expert wilderness guide. Provide a structured JSON response.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: riskAssessmentSchema,
        temperature: 0.5,
      },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as RiskAssessmentData;
  } catch (error) {
    console.error("Error generating risk assessment:", error);
    throw new Error("Failed to generate AI risk assessment.");
  }
};


// --- Existing Location Coordinate Functionality ---
const locationSchema = {
    type: Type.OBJECT,
    properties: {
        lat: { type: Type.NUMBER, description: "Latitude in decimal degrees." },
        lng: { type: Type.NUMBER, description: "Longitude in decimal degrees." },
    },
    required: ["lat", "lng"],
};

export const getCoordinatesForLocation = async (locationName: string): Promise<{ lat: number, lng: number }> => {
    const prompt = `Provide the geographic coordinates (latitude and longitude) for the center of the following location: "${locationName}".`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: locationSchema,
                temperature: 0.2,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error getting coordinates:", error);
        throw new Error("Failed to find coordinates for the specified location.");
    }
};

// --- New Live Weather Functionality ---
export interface LiveWeatherData {
    locationName: string;
    daily: {
        day: string;
        high_f: number;
        low_f: number;
        condition: string;
    }[];
    hourly: {
        time: string;
        temp_f: number;
        condition: string;
    }[];
}

export const getWeatherForLocation = async (location: string): Promise<LiveWeatherData> => {
    const prompt = `
        Get the current 7-day and next 8-hour weather forecast for the location: "${location}".
        
        Respond with ONLY a valid JSON object. Do not include any introductory text, closing text, or markdown fences like \`\`\`json.
        
        The JSON object must have the following structure:
        {
          "locationName": "string",
          "daily": [
            { "day": "string", "high_f": "number", "low_f": "number", "condition": "string" }
          ],
          "hourly": [
            { "time": "string", "temp_f": "number", "condition": "string" }
          ]
        }
        
        Provide 7 days for the 'daily' forecast and 8 hours for the 'hourly' forecast.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.1,
                thinkingConfig: { thinkingBudget: 0 }, // Prioritize low latency
            },
        });

        const jsonText = response.text.trim();
        const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        
        return JSON.parse(cleanedJsonText) as LiveWeatherData;

    } catch (error) {
        console.error("Error fetching weather data:", error);
        if (error instanceof Error && (error.message.includes('JSON') || error.message.includes('Unexpected token'))) {
             throw new Error("Failed to parse weather data. The format from the AI was unexpected.");
        }
        throw new Error("Failed to fetch live weather data. The location may be invalid or the service is unavailable.");
    }
};
