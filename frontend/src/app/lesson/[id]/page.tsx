"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { useLessonSession } from "@/hooks/useLessonSession";
import { LessonHeader } from "@/components/lesson/LessonHeader";
import { FeedbackBar } from "@/components/lesson/FeedbackBar";
import { OutOfHeartsModal } from "@/components/lesson/OutOfHeartsModal";
import { LessonCompleteScreen } from "@/components/lesson/LessonCompleteScreen";
import { MultipleChoice } from "@/components/lesson/exercises/MultipleChoice";
import { TranslateWordBank } from "@/components/lesson/exercises/TranslateWordBank";
import { MatchPairs } from "@/components/lesson/exercises/MatchPairs";
import { FillInBlank } from "@/components/lesson/exercises/FillInBlank";
import { TypeAnswer } from "@/components/lesson/exercises/TypeAnswer";
import { Mascot } from "@/components/lesson/Mascot";
import { Button } from "@/components/ui/Button";
import { RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

function LessonContent() {
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const lessonId = parseInt(rawId || "1", 10);

  const {
    lesson,
    currentExercise,
    totalExercises,
    completedCount,
    mistakesCount,
    hearts,
    shakeHeart,
    currentAnswer,
    setCurrentAnswer,
    hasAnswer,
    isChecking,
    checkResult,
    sessionStatus,
    completionData,
    errorMessage,
    submitCheck,
    skipExercise,
    continueNext,
    refillAndResume,
    retryLoad,
  } = useLessonSession({ lessonId });

  // 1. Loading State
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center select-none">
        <Mascot mood="excited" size={120} className="mb-4 animate-bounce" />
        <h2 className="text-xl font-black text-duo-text-dark tracking-tight">
          Loading your lesson...
        </h2>
        <p className="text-xs font-bold text-gray-400 mt-1">
          Preparing custom exercises
        </p>
      </div>
    );
  }

  // 2. Error State
  if (sessionStatus === "error" || !lesson) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-14 h-14 text-duo-red mb-3" />
        <h2 className="text-2xl font-black text-duo-text-dark tracking-tight mb-2">
          Unable to load lesson
        </h2>
        <p className="text-sm font-semibold text-gray-500 max-w-sm mb-6">
          {errorMessage || "Lesson could not be found or connection failed."}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="primary" size="md" onClick={retryLoad}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link href="/learn">
            <Button variant="secondary" size="md">
              Back to Learn
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Completed Celebration Screen
  if (sessionStatus === "completed" && completionData) {
    return (
      <LessonCompleteScreen
        completion={completionData}
        totalExercises={totalExercises}
        mistakesCount={mistakesCount}
      />
    );
  }

  // 4. Exercise Selector
  const renderExercise = () => {
    if (!currentExercise) return null;

    const commonProps = {
      exercise: currentExercise,
      value: currentAnswer,
      onChange: setCurrentAnswer,
      disabled: sessionStatus !== "in_exercise",
      result: checkResult,
    };

    switch (currentExercise.type) {
      case "multiple_choice":
        return <MultipleChoice {...commonProps} />;
      case "translate_word_bank":
        return <TranslateWordBank {...commonProps} />;
      case "match_pairs":
        return <MatchPairs {...commonProps} />;
      case "fill_in_blank":
        return <FillInBlank {...commonProps} />;
      case "type_answer":
        return <TypeAnswer {...commonProps} />;
      default:
        return (
          <div className="text-center p-8">
            <p className="text-sm text-gray-400">
              Unknown exercise type: {currentExercise.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between select-none">
      {/* Top Header with quit button, smooth progress bar, and hearts */}
      <LessonHeader
        completedCount={completedCount}
        totalExercises={totalExercises}
        hearts={hearts}
        shakeHeart={shakeHeart}
      />

      {/* Main Exercise View */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-2 pb-32 max-w-3xl mx-auto w-full">
        {renderExercise()}
      </main>

      {/* Bottom Sticky Action & Feedback Bar */}
      <FeedbackBar
        status={sessionStatus as "in_exercise" | "feedback" | "hearts_empty" | "submitting"}
        hasAnswer={hasAnswer}
        isChecking={isChecking}
        result={checkResult}
        onCheck={submitCheck}
        onSkip={skipExercise}
        onContinue={continueNext}
      />

      {/* Out of Hearts Modal overlay */}
      {sessionStatus === "hearts_empty" && (
        <OutOfHeartsModal onRefill={refillAndResume} />
      )}
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center select-none">
          <Mascot mood="excited" size={120} className="mb-4 animate-bounce" />
          <h2 className="text-xl font-black text-duo-text-dark tracking-tight">
            Loading your lesson...
          </h2>
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
