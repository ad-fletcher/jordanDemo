import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
// Import necessary types from page.tsx (adjust path if needed)
import { UserProfile, ConversationStep, InterviewQuestion } from "@/app/page";
import { Calendar, Briefcase, ShieldCheck, Activity, CircleHelp, Pill, FileText } from "lucide-react"; // Import necessary icons

// --- Define Types and Interfaces here (Moved from VoiceComponent) ---
interface CardType {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  // color property is already removed
}

// --- Highlight Component (Moved from VoiceComponent) ---
const Highlight: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => {
  const colorClasses: { [key: string]: string } = {
    blue: "text-blue-600 dark:text-blue-400 font-medium",
    purple: "text-purple-600 dark:text-purple-400 font-medium",
    green: "text-green-600 dark:text-green-400 font-medium",
    red: "text-red-600 dark:text-red-400 font-medium",
    orange: "text-orange-600 dark:text-orange-400 font-medium",
    yellow: "text-yellow-600 dark:text-yellow-400 font-medium",
    pink: "text-pink-600 dark:text-pink-400 font-medium",
    indigo: "text-indigo-600 dark:text-indigo-400 font-medium",
    gray: "text-gray-600 dark:text-gray-400 font-medium",
  };
  return <span className={cn(colorClasses[color] || "font-medium", "mx-1")}>{children}</span>;
};

// --- Define Props Interface ---
interface ProfileSummaryDisplayProps {
  userProfile: UserProfile;
  conversationStep: ConversationStep;
  interviewQuestions: InterviewQuestion[];
}

// --- Component Definition ---
const ProfileSummaryDisplay: React.FC<ProfileSummaryDisplayProps> = ({
  userProfile,
  conversationStep,
  interviewQuestions,
}) => {

  // --- Derived State: Profile Cards (Moved from VoiceComponent) ---
  const profileCards: CardType[] = useMemo(() => {
    const cards: CardType[] = [];
    console.log("Recalculating profileCards in ProfileSummaryDisplay. Step:", conversationStep, "Profile:", userProfile);

    if (!interviewQuestions) return cards;

    interviewQuestions.forEach(qData => {
      const profileValue = userProfile[qData.key as keyof UserProfile];
      const currentStepIndex = interviewQuestions.findIndex(q => q.key === conversationStep);
      const cardStepIndex = interviewQuestions.findIndex(q => q.key === qData.key);

      // Only show if value exists and is for a step *before* the current one
      if (profileValue && cardStepIndex < currentStepIndex && String(profileValue).trim() !== "") {
          let cardContentElement: React.ReactNode;
          // Use the original cardColor prop from interviewQuestions for the Highlight component
          const highlightColor = qData.cardColor || 'gray'; // Fallback color

          // Generate content based on key
          switch(qData.key) {
            case 'age': cardContentElement = <p>You are <Highlight color={highlightColor}>{profileValue}</Highlight> years old.</p>; break;
            case 'lifeStage': cardContentElement = <p>Current stage: <Highlight color={highlightColor}>{profileValue}</Highlight>.</p>; break;
            case 'helmetUsage': cardContentElement = <p>Uses safety gear: <Highlight color={highlightColor}>{profileValue}</Highlight>.</p>; break;
            case 'healthVision': cardContentElement = <p>Health vision: <Highlight color={highlightColor}>{profileValue}</Highlight>.</p>; break;
            case 'moneyRelationship': cardContentElement = <p>Money/Health: <Highlight color={highlightColor}>{profileValue}</Highlight>.</p>; break;
            case 'medications': cardContentElement = <p>Medications: <Highlight color={highlightColor}>{profileValue}</Highlight>.</p>; break;
            case 'recordPermission': cardContentElement = <p>Record linking ok: <Highlight color={highlightColor}>{profileValue}</Highlight>.</p>; break;
            case 'additionalHealthInfo': cardContentElement = <p>Notes: <Highlight color={highlightColor}>{profileValue}</Highlight>.</p>; break;
            default: cardContentElement = <p><Highlight color={highlightColor}>{profileValue}</Highlight></p>;
          }

          cards.push({
            id: cardStepIndex + 1,
            title: qData.profileLabel,
            subtitle: "Profile Summary",
            icon: qData.icon, // Icon comes directly from interviewQuestions
            content: cardContentElement,
            // No color property needed here
          });
      }
    });

    return cards;
  }, [userProfile, conversationStep, interviewQuestions]);
  // ---------------------------------------------------------------\n\n  // --- Rendering Logic (Moved from VoiceComponent) ---
  if (profileCards.length === 0) {
    return null; // Don't render anything if there are no cards to show
  }

  return (
    // Adjust grid columns for different screen sizes
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4 border-t border-border">
      {profileCards.map((card) => (
        <Card key={card.id} className={cn(
          "shadow-md",
          // Consistent background styling
          "bg-background/50",
          "backdrop-blur-xl",
          "border border-foreground/10",
          "relative overflow-hidden rounded-lg"
        )}>
          {/* Background Gradient Div */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#a1887f]/20 via-stone-400/20 to-[#8d6e63]/20 rounded-2xl blur-2xl opacity-75 z-0" />

          {/* Content Wrapper Div */}
          <div className="relative z-10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground pb-1">{card.subtitle}</div>
              <div className="text-base font-medium"> {card.content}</div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
   };

export default ProfileSummaryDisplay;