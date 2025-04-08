"use client"; // Add use client directive

import React, { useState, useCallback } from "react"; // Import hooks
import VoiceComponent from "@/components/VoiceComponent";
import ProgressCard from "@/components/ProgressCard"; // Import ProgressCard
import ProfileSummaryDisplay from '@/components/ProfileSummaryDisplay'; // <-- IMPORT ProfileSummaryDisplay
import { Calendar, Briefcase, ShieldCheck, Activity, CircleHelp, Pill, FileText } from "lucide-react"; // Import icons
import { BackgroundPaths } from "@/components/ui/background-paths"; // Import the new splash screen component

// --- Define Types and Interfaces here --- 
export interface UserProfile {
  name?: string;
  age?: string;
  lifeStage?: string;
  helmetUsage?: string;
  healthVision?: string;
  moneyRelationship?: string;
  medications?: string;
  recordPermission?: string;
  additionalHealthInfo?: string;
}

export type ConversationStep = "welcome" | "name" | "age" | "lifeStage" | "helmetUsage" | "healthVision" | "moneyRelationship" | "medications" | "recordPermission" | "additionalHealthInfo" | "summary";

export interface InterviewQuestion {
  key: ConversationStep;
  question: string;
  profileLabel: string;
  icon: React.ReactNode;
  cardColor: string;
}
// ---------------------------------------

// --- Define Interview Questions here --- 
const interviewQuestions: InterviewQuestion[] = [
    // Note: Removed 'name' step as it's not in the screenshot's flow
    { key: 'age', question: "First, how old are you?", profileLabel: "Age", icon: <Calendar className="size-4 text-blue-500" />, cardColor: "blue" },
    { key: 'lifeStage', question: "What life stage best describes you currently (e.g., Education/Training, Early Career, Established Career, Family Formation, Empty Nest, Retirement Preparation)?", profileLabel: "Life Stage", icon: <Briefcase className="size-4 text-purple-500" />, cardColor: "purple" },
    { key: 'helmetUsage', question: "When engaging in activities with potential physical risk (like cycling, skiing, etc.), how often do you use safety equipment like helmets? (e.g., Always, Sometimes, Rarely, Never)", profileLabel: "Helmet Usage", icon: <ShieldCheck className="size-4 text-orange-500" />, cardColor: "orange" },
    { key: 'healthVision', question: "What's most important to you regarding your long-term health? (e.g., Maintaining mobility, energy, cognitive function, longevity, overall balance)", profileLabel: "Health Vision", icon: <Activity className="size-4 text-green-500" />, cardColor: "green" },
    { key: 'moneyRelationship', question: "How would you describe your relationship with money regarding health decisions? (e.g., Cautious, Balanced, Investing, Anxious, Avoidant)", profileLabel: "Money Relationship", icon: <CircleHelp className="size-4 text-yellow-500" />, cardColor: "yellow" },
    { key: 'medications', question: "Are you currently taking any regular medications? If so, could you list them? (Type 'None' if not applicable)", profileLabel: "Medications", icon: <Pill className="size-4 text-pink-500" />, cardColor: "pink" },
    { key: 'recordPermission', question: "Would you be open to potentially linking your medical records later to get more personalized insights? (Yes/No)", profileLabel: "Record Permission", icon: <FileText className="size-4 text-indigo-500" />, cardColor: "indigo" },
    { key: 'additionalHealthInfo', question: "Is there any other important health information you'd like to share at this time? (Type 'None' if not applicable)", profileLabel: "Additional Health Info", icon: <CircleHelp className="size-4 text-gray-500" />, cardColor: "gray" },
];
// ---------------------------------------


export default function Home() {
  // --- State Management --- 
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [conversationStep, setConversationStep] = useState<ConversationStep>("welcome");
  const [showMainApp, setShowMainApp] = useState(false); // <-- ADDED state
  const [userName, setUserName] = useState(""); // <-- ADDED state for name
  // ------------------------

  // --- Callback Functions --- 
  const handleProfileUpdate = useCallback((field: keyof UserProfile, value: string) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
    console.log(`Profile updated in page: ${field} = ${value}`);
  }, []);

  const handleStepChange = useCallback((newStep: ConversationStep) => {
    setConversationStep(newStep);
    console.log(`Step changed in page: ${newStep}`);
  }, []);
  // --------------------------

  // --- Splash Screen Handler --- 
  const handleStartApp = (name: string) => { // <-- MODIFIED to accept name
    setUserName(name || "User"); // Store name (fallback to "User")
    setShowMainApp(true);
    // DO NOT set conversationStep here anymore
    // setConversationStep("age"); 
    console.log(`Showing main application for user: ${name || 'User'}... Conversation step remains 'welcome'.`);
  };
  // ---------------------------

  return (
    <>
      {/* --- Splash Screen (Overlay) --- */}
      {!showMainApp && ( // Render splash screen if showMainApp is false
        <div className="fixed inset-0 z-50"> {/* Use fixed positioning to overlay */} 
            {/* Loro Piana Style Header */}
            <div className="relative z-20 w-full bg-[#f5f1e8] dark:bg-[#2b2823]">
            {/* Top announcement bar */}
            <div className="w-full py-2 text-center text-xs tracking-wider text-[#6e5f45] dark:text-[#d8cfbd]">
              Discover personalized wellness at your fingertips
            </div>

            {/* Divider Lines */}
            <div className="px-6">
              <div className="w-full h-0.5 bg-[#a1887f]"></div> {/* Darker Brown/Taupe Line */}
              <div className="w-full h-px bg-[#c5b299]"></div> {/* Lighter Taupe Line */}
            </div>

            {/* Main header - Simplified */}
            <div className="w-full py-4 px-6 flex items-center justify-center relative">
              <div className="flex items-center">
                <span className="font-serif italic text-xl text-[#916e58]">Health Companion</span>
              </div>
            </div>
          </div>
          {/* --- End Header --- */}
          <BackgroundPaths
            title="HEALTH COMPANION" // Customize as needed
            subtitle="Let's get started. Please enter your name below." // Added subtitle
            buttonText="Begin Journey"  
            onStartApp={handleStartApp} // Pass updated handler
          />
        </div>
      )}

      {/* --- Original Main Content (Rendered only when showMainApp is true) --- */}
      {showMainApp && (
        <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-[#f5f1e8] dark:bg-[#2b2823]">
          <div className="absolute -z-10 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-[100px] animate-pulse" />

          {/* Loro Piana Style Header */}
          <div className="relative z-20 w-full bg-[#f5f1e8] dark:bg-[#2b2823]">
            {/* Top announcement bar */}
            <div className="w-full py-2 text-center text-xs tracking-wider text-[#6e5f45] dark:text-[#d8cfbd]">
              Discover personalized wellness at your fingertips
            </div>

            {/* Divider Lines */}
            <div className="px-6">
              <div className="w-full h-0.5 bg-[#a1887f]"></div> {/* Darker Brown/Taupe Line */}
              <div className="w-full h-px bg-[#c5b299]"></div> {/* Lighter Taupe Line */}
            </div>

            {/* Main header - Display User Name */}

          </div>
          {/* --- End Header --- */}

          {/* --- Main Content Area --- */}
          <div className="relative z-10 container mx-auto px-4 py-12 w-full flex-grow">
            {/* Header Section */}
            <div className="flex justify-center mb-16">
              <h1 className="font-serif text-4xl sm:text-5xl tracking-wide text-[#8B4B3E] dark:text-[#c5b299]">
                Welcome {userName}
              </h1>
            </div>

            {/* --- Grid Layout for Chat and Progress --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8"> {/* Add margin-bottom to the grid */} 
              {/* Left Column: Chat */} 
              <div className="lg:col-span-2 flex flex-col"> {/* Removed gap from here */}
                <VoiceComponent
                  userProfile={userProfile}
                  conversationStep={conversationStep}
                  interviewQuestions={interviewQuestions} 
                  onProfileUpdate={handleProfileUpdate}
                  onStepChange={handleStepChange}
                />
                
                {/* MOVED ProfileSummaryDisplay from here */}

              </div>
              
              {/* Right Column: Progress Card */} 
              <div className="lg:col-span-1 hidden lg:block"> 
                 <ProgressCard 
                    currentStepKey={conversationStep}
                    questions={interviewQuestions}
                    profile={userProfile}
                 />
              </div>
            </div>
            {/* --- End Grid Layout --- */}

            {/* --- RENDER ProfileSummaryDisplay BELOW the main grid --- */}
            <ProfileSummaryDisplay
                userProfile={userProfile}
                conversationStep={conversationStep}
                interviewQuestions={interviewQuestions}
            />

          </div>
          {/* --- End Main Content Area --- */}
        </main>
      )}
    </>
  );
}
