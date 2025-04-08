import { NextRequest, NextResponse } from 'next/server';
// Import the SDK
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Define the expected request body structure
interface ParseRequestBody {
  message: string;
  step: string; 
  question?: string; // Added optional question text
}

// Define the structured response we expect back from Gemini
interface GeminiParseResult {
  updateNeeded: boolean;
  profileField?: string; 
  extractedValue?: string; 
}

// Initialize Gemini Client 
// IMPORTANT: Ensure GEMINI_API_KEY is set in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// --- Actual Gemini API Call Implementation ---
async function callGeminiApi(prompt: string, userMessage: string, questionText?: string): Promise<GeminiParseResult> {
  console.log("--- Calling Gemini API ---");
  console.log("Step-specific Task Prompt:", prompt);
  if(questionText) console.log("Context Question:", questionText); // Log if present
  console.log("User Message:", userMessage);

  if (!process.env.GEMINI_API_KEY) {
      console.error("Gemini API Key not found in environment variables.");
      // Return a default non-update response or throw an error
      return { updateNeeded: false }; 
  }

  try {
    // For text-only input, use the gemini-1.5-flash model
    // Adjust model name if needed (e.g., "gemini-1.5-pro-latest")
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
        // Optional: Adjust safety settings if needed
        // safetySettings: [
        //     { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        // ],
        // Specify JSON output format if the model/API version supports it directly
        // This might require specific prompting or model versions.
        // For now, we rely on the prompt asking for JSON.
         generationConfig: {
             responseMimeType: "application/json",
         },
    });

    // Construct the full prompt including the context question and user message
    const context = questionText ? `The user was just asked: "${questionText}"` : "The user provided the following message:";
    const fullPrompt = `${prompt}\n\n${context}\nUser Message: "${userMessage}"\n\nRespond strictly with the JSON structure specified in the initial instruction.`;

    console.log("Full prompt being sent:", fullPrompt);

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const responseText = response.text();

    console.log("Raw Gemini Response Text:", responseText);

    // Attempt to parse the JSON response from the text
    try {
        // Clean the response text if necessary (sometimes models add backticks or 'json' prefix)
        const cleanedText = responseText.replace(/```json\n?|```/g, '').trim();
        const parsedJson: GeminiParseResult = JSON.parse(cleanedText);
        
        // Validate the parsed structure (basic check)
        if (typeof parsedJson.updateNeeded === 'boolean') {
            console.log("--- Gemini Result Parsed Successfully ---", parsedJson);
            return {
                updateNeeded: parsedJson.updateNeeded,
                profileField: parsedJson.profileField,
                extractedValue: parsedJson.extractedValue
            };
        } else {
             console.error("Parsed JSON lacks expected 'updateNeeded' field:", parsedJson);
             return { updateNeeded: false }; // Treat invalid JSON structure as no update
        }

    } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON:", parseError);
        console.error("Original response text was:", responseText); // Log the text that failed parsing
        // Fallback: If JSON parsing fails, treat as no update
        return { updateNeeded: false }; 
    }

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    // Handle specific API errors if needed
    return { updateNeeded: false }; // Return default on API error
  }
}

// --- POST Handler (remains largely the same) ---
export async function POST(req: NextRequest) {
  try {
    // Extract question along with message and step
    const body: ParseRequestBody = await req.json();
    const { message, step, question } = body; 

    if (!message || !step) {
      return NextResponse.json({ error: 'Missing message or step in request body' }, { status: 400 });
    }

    // The prompt variable now describes the *task* based on the step
    let taskPrompt = "";
    switch (step) {
       case 'age':
        taskPrompt = "Analyze the following user message. Does it state the user's age clearly as a number? If yes, extract the age. Respond ONLY with JSON in the format: {\"updateNeeded\": boolean, \"profileField\": \"age\", \"extractedValue\": string | null}. If no age is clearly stated, respond with {\"updateNeeded\": false}.";
        break;
      case 'lifeStage': // Updated key
        taskPrompt = "Analyze the user message regarding their life stage (e.g., education, training, early career, established career, family formation, empty nest, retirement). Does it clearly indicate their current stage? If yes, extract the stage. Respond ONLY with JSON in the format: {\"updateNeeded\": boolean, \"profileField\": \"lifeStage\", \"extractedValue\": string | null}. If no stage is clearly stated, respond with {\"updateNeeded\": false}."; 
        break;
      case 'helmetUsage': // Updated key
         taskPrompt = "Analyze the user message regarding safety equipment usage frequency (e.g., always, sometimes, rarely, never). Extract the stated frequency. Respond ONLY with JSON: {\"updateNeeded\": boolean, \"profileField\": \"helmetUsage\", \"extractedValue\": string | null}. If no frequency stated, respond {\"updateNeeded\": false}.";
        break;
      case 'healthVision': // Updated key
         taskPrompt = "Analyze the user message for their primary health vision/goal (e.g., energy, cognitive function, physical mobility, longevity, overall balance). Extract the stated goal. Respond ONLY with JSON: {\"updateNeeded\": boolean, \"profileField\": \"healthVision\", \"extractedValue\": string | null}. If no goal stated, respond {\"updateNeeded\": false}.";
        break;
        case 'moneyRelationship': // Updated key
         taskPrompt = "Analyze the user message for their relationship with money regarding health (e.g., cautious, balanced, investing, anxious, avoidant). Extract the stated relationship. Respond ONLY with JSON: {\"updateNeeded\": boolean, \"profileField\": \"moneyRelationship\", \"extractedValue\": string | null}. If no relationship stated, respond {\"updateNeeded\": false}.";
        break;
       case 'medications': // Updated key
         taskPrompt = "Analyze the user message regarding current medications. Extract the medication list or 'None'. Respond ONLY with JSON: {\"updateNeeded\": boolean, \"profileField\": \"medications\", \"extractedValue\": string | null}. Respond {\"updateNeeded\": false} if unclear.";
        break;
      case 'recordPermission': // Updated key
         taskPrompt = "Analyze the user message regarding permission to link medical records (Yes/No). Extract the answer. Respond ONLY with JSON: {\"updateNeeded\": boolean, \"profileField\": \"recordPermission\", \"extractedValue\": string | null}. Respond {\"updateNeeded\": false} if unclear.";
        break;
      case 'additionalHealthInfo': // Updated key
         taskPrompt = "Analyze the user message for any additional health info shared. This will be the last part of the interview so it will close on this. Extract the info or say Not now. Respond ONLY with JSON: {\"updateNeeded\": boolean, \"profileField\": \"additionalHealthInfo\", \"extractedValue\": string | null}. Respond {\"updateNeeded\": false} if topic seems unrelated.";
        break;
      default:
        console.log(`No specific parsing task prompt for step: ${step}`);
        return NextResponse.json({ update: false }); 
    }

    // Call the implemented Gemini API function
    const geminiResult = await callGeminiApi(taskPrompt, message, question);

    // Format the response for the frontend hook
    const responsePayload = {
      update: geminiResult.updateNeeded,
      field: geminiResult.profileField,
      value: geminiResult.extractedValue,
    };

    console.log("Sending payload to frontend:", responsePayload);
    return NextResponse.json(responsePayload);

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 