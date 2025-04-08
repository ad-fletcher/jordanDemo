"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useConversation } from "@11labs/react";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { ChatButton } from "@/components/ui/chatbutton";
import { Mic, MicOff, Volume2, VolumeX, Calendar, Briefcase, Activity, Heart, ShieldCheck, Pill, FileText, CircleHelp } from "lucide-react";
import {
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { cn } from "@/lib/utils";
import { ChatPreview } from "./ui/chat-preview";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useProfileParser } from "@/hooks/useProfileParser";

// --- Import Types from page.tsx --- 
import { UserProfile, ConversationStep, InterviewQuestion } from "@/app/page"; // Adjust path if necessary
// -----------------------------------

// --- Define Local Types --- 
interface Message {
  source: "user" | "ai";
  message: string;
}

// Props Interface uses imported types
interface VoiceComponentProps {
  userProfile: UserProfile;
  conversationStep: ConversationStep;
  interviewQuestions: InterviewQuestion[];
  onProfileUpdate: (field: keyof UserProfile, value: string) => void;
  onStepChange: (newStep: ConversationStep) => void;
}

const VoiceChat: React.FC<VoiceComponentProps> = ({
  userProfile, 
  conversationStep,
  interviewQuestions, 
  onProfileUpdate,
  onStepChange,
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  // --- Ref to track the current step for callbacks ---
  const stepRef = useRef(conversationStep);
  useEffect(() => {
    stepRef.current = conversationStep; // Update ref when prop changes
    console.log("Conversation step prop updated in ref:", stepRef.current);
  }, [conversationStep]);
  // --------------------------------------------------

  const { parseUserMessage, isLoading: isParsing, error: parseError } = useProfileParser();

  // --- Define Callbacks for useConversation with useCallback --- 
  const handleConnect = useCallback(() => {
    console.log("Connected to ElevenLabs");
    setMessages([]);
    setErrorMessage("");
    // Reset profile/step via parent callbacks
    Object.keys(userProfile).forEach(key => onProfileUpdate(key as keyof UserProfile, "")); // Clear all fields
    onStepChange("welcome"); 
  }, [onProfileUpdate, onStepChange, userProfile]); // Added userProfile dependency

  const handleDisconnect = useCallback(() => {
    console.log("Disconnected from ElevenLabs");
  }, []);

  const handleMessage = useCallback(async (message: any) => {
    console.log("onMessage received:", JSON.stringify(message, null, 2));

    if (message && typeof message.source === 'string' && typeof message.message === 'string') {
      console.log(`Adding message from ${message.source}: "${message.message.substring(0, 50)}..."`); 
      setMessages((prevMessages) => [...prevMessages, message as Message]);

      if (message.source === 'user' && message.message.trim() !== "") {
        const currentStepForParsing = stepRef.current; 
        console.log(`Attempting to parse user message for step (from ref): ${currentStepForParsing}`);
        
        const currentQuestionData = interviewQuestions.find(q => q.key === currentStepForParsing);
        const questionText = currentQuestionData?.question || "";

        if (!questionText && currentStepForParsing !== 'welcome') { 
            console.warn(`Could not find question text for step: ${currentStepForParsing}`);
        } else if (currentStepForParsing !== 'welcome') {
            console.log(`Parsing user message for step: ${currentStepForParsing} with question: ${questionText}`);
            const parseResult = await parseUserMessage(message.message, currentStepForParsing, questionText);
            
            if (parseResult.update && parseResult.field && parseResult.value) {
                console.log(`Parse successful: Updating profile field '${parseResult.field}' with value '${parseResult.value}'`);
                onProfileUpdate(parseResult.field as keyof UserProfile, parseResult.value);
                
                const currentIndex = interviewQuestions.findIndex(q => q.key === currentStepForParsing);
                let nextStepKey: ConversationStep = "summary";
                if (currentIndex !== -1 && currentIndex < interviewQuestions.length - 1) {
                    nextStepKey = interviewQuestions[currentIndex + 1].key;
                }
                
                console.log(`Transitioning to next step: ${nextStepKey}`);
                onStepChange(nextStepKey); 
            } else {
                console.log("Parser did not find an update for the current step (from ref).");
            }
        }
      }
    } else {
      console.warn("Received message with unexpected structure:", message);
    }
  }, [interviewQuestions, parseUserMessage, onProfileUpdate, onStepChange]); // stepRef is stable, setMessages is stable

  const handleError = useCallback((error: string | Error) => {
    const errorMsg = typeof error === "string" ? error : error.message;
    setErrorMessage(errorMsg);
    console.error("Error:", error);
    setMessages((prev) => [...prev, { source: 'ai', message: `Error: ${errorMsg}` }]);
  }, []); // setErrorMessage and setMessages are stable
  // -------------------------------------------------------------

  const conversation = useConversation({
    // Pass stable callback references
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onMessage: handleMessage,
    onError: handleError,
  });

  const { status, isSpeaking, startSession, endSession, setVolume } = conversation;

  // Mic Permission Check Effect
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
        setErrorMessage("");
      } catch (error: any) {
        setErrorMessage("Microphone access denied. Please allow microphone access in your browser settings.");
        console.error("Error accessing microphone:", error);
        setHasPermission(false);
      }
    };

    requestMicPermission();
  }, []); // Corrected: Ensure only one argument (empty dependency array)

  // Original handlers for Start/End buttons
  const handleStartConversation = useCallback(async () => {
    if (!hasPermission) {
      setErrorMessage("Cannot start: Microphone access denied.");
      return;
    }
    if (status !== 'connected') {
      try {
        await startSession({
          agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
        });
        // --- Call callback to set initial step --- 
        const firstQuestionKey = interviewQuestions[0]?.key;
        if (firstQuestionKey) {
             onStepChange(firstQuestionKey);
             console.log(`Started conversation, initial step set via callback to '${firstQuestionKey}'.`);
         } else {
             onStepChange('summary'); // Fallback if no questions
             console.warn("Started conversation, but no questions found. Setting step to summary.");
         }
        // -----------------------------------------
      } catch (error: any) {
        const errorMsg = typeof error === "string" ? error : error.message;
        setErrorMessage(`Failed to start conversation: ${errorMsg}`);
      console.error("Error starting conversation:", error);
      }
    }
  }, [hasPermission, status, startSession, onStepChange, interviewQuestions]); // Added dependencies

  const handleEndConversation = async () => {
    if (status === 'connected') {
      try {
        await endSession(); 
        console.log("Ended conversation");
         // Optionally reset state via callbacks here too
         // Object.keys(userProfile).forEach(key => onProfileUpdate(key as keyof UserProfile, ""));
         // onStepChange("welcome");
      } catch (error: any) {
        const errorMsg = typeof error === "string" ? error : error.message;
        setErrorMessage(`Failed to end conversation: ${errorMsg}`);
      console.error("Error ending conversation:", error);
      }
    }
  };

  const toggleMute = async () => {
    if (status !== 'connected') return;
    try {
      await setVolume({ volume: isMuted ? 1 : 0 }); 
      setIsMuted(!isMuted);
    } catch (error: any) {
      setErrorMessage("Failed to change volume");
      console.error("Error changing volume:", error);
    }
  };

  // Define the controls to be passed to the header
  const chatHeaderControls = (
    <div className="flex items-center gap-2">
      {/* Status Indicator */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className={cn(
          "h-2 w-2 rounded-full",
          status === 'connected' ? 'bg-green-500' :
          status === 'connecting' || status === 'disconnecting' ? 'bg-yellow-500' :
          'bg-red-500'
        )} />
        {status}
      </div>
      {/* Mute Button */}
            <Button
        variant="ghost"
              size="icon"
              onClick={toggleMute}
              disabled={status !== "connected"}
        className="h-6 w-6"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
  );

  return (
    <div className={cn(
      "w-full flex flex-col h-full"
    )}>
      {/* Use ChatPreview for the entire chat structure */}
      <ChatPreview
        headerControls={chatHeaderControls}
        className="h-full"
      >
        {conversationStep === "welcome" && !messages.length && (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
            <h2 className="text-xl font-medium text-stone-700 dark:text-stone-300">
              Welcome to Your Health Audit
            </h2>
            <p className="text-stone-500 dark:text-stone-400 text-center max-w-md">
              Click the button below to start your conversation with Jordan. 
              He'll guide you through a series of questions about your health and lifestyle.
            </p>

          </div>
        )}
        {parseError && (
          <div className="p-4 text-red-500 text-sm">
            {parseError}
          </div>
        )}
        {!hasPermission && errorMessage && (
          <div className="p-4 text-yellow-500 text-sm">
            {errorMessage}
          </div>
        )}
        {hasPermission && errorMessage && status !== 'connected' && (
          <div className="p-4 text-red-500 text-sm">
            {errorMessage}
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3",
              msg.source === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
              msg.source === "ai" 
                ? "bg-gray-200"
                : "bg-gradient-to-br from-purple-400 to-purple-600"
            )}>
              {msg.source === "ai" ? (
                <Image 
                  src="/jordan-avatar.png"
                  alt="Jordan Avatar"
                  width={40}
                  height={40}
                  className="object-cover mt-4"
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  Y
                </span>
              )}
            </div>
            {/* Message content */}
            <div className={cn(
              "flex flex-col gap-1 max-w-[80%]"
            )}>
              <span className={cn(
                "text-sm font-bold",
                msg.source === "ai" 
                  ? "text-[#4284F7]"
                  : "text-[#B66DFF]"
              )}>
                {msg.source === "ai" ? "Jordan" : "You"}
              </span>
              <span className="text-sm text-foreground/70">
                {msg.message}
              </span>
              <span className="text-xs text-muted-foreground">
                just now
              </span>
            </div>
          </div>
        ))}
        {messages.length === 0 && status === 'connected' && !isSpeaking && !isParsing && (
          <div className="p-4 text-stone-500 text-sm">
            Listening...
          </div>
        )}
        {status === 'connected' && isSpeaking && (
          <div className="p-4 text-stone-500 text-sm">
            Agent is speaking...
          </div>
        )}
      </ChatPreview>

      {/* Footer remains outside ChatPreview */}
      <ExpandableChatFooter className="flex justify-center gap-2 flex-shrink-0 mt-auto border-t">
            {status === "connected" ? (
          <ChatButton
                variant="destructive"
                onClick={handleEndConversation}
                className="w-full"
              >
            <MicOff className="mr-2" />
                End Conversation
          </ChatButton>
            ) : (
          <ChatButton
                onClick={handleStartConversation}
            disabled={!hasPermission || status === 'connecting'}
                className="w-full"
              >
            <Mic className="mr-2" />
                Start Conversation
          </ChatButton>
        )}
      </ExpandableChatFooter>
        </div>
  );
};

export default VoiceChat;
