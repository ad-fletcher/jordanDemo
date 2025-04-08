"use client";

import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Import types from page.tsx
import { UserProfile, ConversationStep, InterviewQuestion } from "@/app/page";

interface ProgressCardProps {
  currentStepKey: ConversationStep;
  questions: InterviewQuestion[];
  profile: UserProfile;
  className?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ 
  currentStepKey, 
  questions, 
  profile, 
  className 
}) => {

  // --- Refined Progress Calculations --- 
  const progressData = useMemo(() => {
    const totalSteps = questions.length;
    
    // Count answered questions by checking the profile against the question keys
    const answeredCount = questions.reduce((count, q) => {
      const value = profile[q.key as keyof UserProfile];
      // Count if the key exists in profile and the value is not null/undefined/empty string
      return value && String(value).trim() !== '' ? count + 1 : count;
    }, 0);

    const remainingCount = totalSteps - answeredCount;
    const percentage = totalSteps > 0 ? Math.round((answeredCount / totalSteps) * 100) : 0;
    
    let currentStepNumber = 0;
    if (currentStepKey === 'summary') {
        currentStepNumber = totalSteps;
    } else if (currentStepKey !== 'welcome') {
        const currentIndex = questions.findIndex(q => q.key === currentStepKey);
        currentStepNumber = currentIndex !== -1 ? currentIndex + 1 : 0; // Start from step 1 after welcome
    }

    return { totalSteps, answeredCount, remainingCount, percentage, currentStepNumber };

  }, [currentStepKey, questions, profile]);
  // ----------------------------------------

  // --- SVG Radial Chart Parameters --- 
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressData.percentage / 100) * circumference;
  // ------------------------------------

  return (
    <Card className={cn(
      "sticky top-24",
      "bg-background/50",
      "backdrop-blur-xl",
      "rounded-lg shadow-lg", 
      "border border-foreground/10",
      "p-6",
      className
    )}>
      {/* Remove CardHeader, integrate title into CardContent area */}
      <CardContent className="flex flex-col items-center justify-center p-0"> {/* Remove default padding */}
         {/* Title */}
         <h2 className="text-base font-medium text-classy dark:text-classy-dark mb-10">Onboarding Progress</h2>

        {/* --- SVG Radial Chart --- */}
        <div className="relative w-48 h-48 mb-6"> {/* Increased size */}
          <svg className="w-full h-full" viewBox="0 0 150 150"> {/* Adjusted viewBox */}
             {/* Background Circle */}
            <circle
              className="text-stone-200 dark:text-stone-700/50"
              strokeWidth="12" // Thicker stroke
              stroke="currentColor"
              fill="transparent"
              r={radius} 
              cx="75" // Center based on new viewBox
              cy="75"
            />
             {/* Progress Arc - Using CSS transition via inline style */}
            <circle
              className="text-[#a1887f]" // Use the brown color from header lines
              strokeWidth="12"
              strokeDasharray={circumference} 
              // strokeDashoffset={offset} // Set via style for transition
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="75"
              cy="75"
              transform="rotate(-90 75 75)" // Start from top
              style={{
                strokeDashoffset: offset, 
                transition: 'stroke-dashoffset 1000ms ease-in-out' // Apply CSS transition
              }}
            />
             {/* Text Inside Circle */}
             <text 
                x="50%" 
                y="48%" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-4xl font-semibold"
                fill="#916e58" 
             >
                 {progressData.percentage}%
             </text>
              {/* ------------------------ */}
    


             {/* <text 
                x="50%" 
                y="65%" // Position below percentage
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-xs font-medium text-stone-500 dark:text-stone-400">
                Step {progressData.currentStepNumber} / {progressData.totalSteps}
             </text> */}
          </svg>
        </div>
        {/* ------------------------ */}

        {/* --- Summary Stats --- */}
        <div className="grid grid-cols-3 gap-4 w-full text-center px-4">
           <div>
             <p className="text-xl font-semibold text-classy dark:text-classy-dark">{progressData.answeredCount}</p>
             <p className="text-xs text-classy dark:text-classy-dark">Answered</p>
           </div>
           <div>
             <p className="text-xl font-semibold text-classy dark:text-classy-dark">{progressData.remainingCount}</p>
             <p className="text-xs text-classy dark:text-classy-dark">Remaining</p>
           </div>
           <div>
             <p className="text-xl font-semibold text-classy dark:text-classy-dark">{progressData.percentage}%</p>
             <p className="text-xs text-classy dark:text-classy-dark">Profile</p>
           </div>
        </div>
        {/* --------------------- */}
      </CardContent>
    </Card>
  );
};

export default ProgressCard; 