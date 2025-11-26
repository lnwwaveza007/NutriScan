import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NutritionalInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING, description: "The name of the identified food dish." },
    calories: { type: Type.NUMBER, description: "Estimated total calories. Be strict and realistic." },
    protein: { type: Type.NUMBER, description: "Estimated protein in grams." },
    carbs: { type: Type.NUMBER, description: "Estimated carbohydrates in grams." },
    fat: { type: Type.NUMBER, description: "Estimated fat in grams." },
    portionEstimate: { type: Type.STRING, description: "Description of the estimated portion size (e.g., '1 large bowl', '200g')." },
    reasoning: { type: Type.STRING, description: "Brief explanation of how the calories were calculated based on visual ingredients." },
  },
  required: ["foodName", "calories", "protein", "carbs", "fat", "portionEstimate", "reasoning"],
};

export const analyzeFoodImage = async (base64Image: string): Promise<NutritionalInfo> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: "Analyze this food image strictly. Identify the dish and estimate the nutritional content based on visible portion sizes. If the food looks oily, dense, or large, do not underestimate calories. Provide a realistic assessment.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert nutritionist and dietitian known for strict and realistic calorie counting. You analyze food photos to help users track their intake accurately. Do not underestimate portion sizes. If ingredients are hidden (like sauces or oils), assume a standard restaurant preparation which is usually higher in calories. Output valid JSON matching the schema.",
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini.");
    }

    const data = JSON.parse(response.text) as NutritionalInfo;
    return data;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
