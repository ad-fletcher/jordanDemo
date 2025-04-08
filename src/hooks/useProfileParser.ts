import { useState, useCallback } from 'react';

// Define the expected structure of the response from our backend API
interface ParseResult {
  update: boolean;
  field?: string; // e.g., 'age', 'careerStage'
  value?: string; // e.g., '21', 'Education/Training'
}

// Define the possible conversation steps (mirroring VoiceComponent)
type ConversationStep = "welcome" | "name" | "age" | "lifeStage" | "helmetUsage" | "healthVision" | "moneyRelationship" | "medications" | "recordPermission" | "additionalHealthInfo" | "summary";

export function useProfileParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseUserMessage = useCallback(async (userMessage: string, currentStep: ConversationStep, questionText: string): Promise<ParseResult> => {
    setIsLoading(true);
    setError(null);
    console.log(`useProfileParser: Parsing message for step '${currentStep}': "${userMessage.substring(0, 50)}..."`);
    console.log(`useProfileParser: Context question: "${questionText}"`);

    try {
      // Call the backend API route
      const response = await fetch('/api/parse-profile-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage, 
          step: currentStep,
          question: questionText
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const result: ParseResult = await response.json();
      console.log('useProfileParser: Received API response:', result);
      setIsLoading(false);
      return result;

    } catch (err: any) {
      console.error('useProfileParser: Error calling parse API:', err);
      setError(err.message || 'Failed to parse message');
      setIsLoading(false);
      // Return a non-update result in case of error
      return { update: false }; 
    }
  }, []); // Empty dependency array means this function reference doesn't change

  return { parseUserMessage, isLoading, error };
} 