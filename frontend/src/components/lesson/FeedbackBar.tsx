"use client";

import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import type { AnswerResponse } from "@/types";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

interface FeedbackBarProps {
  status: "in_exercise" | "feedback" | "hearts_empty" | "submitting";
  hasAnswer: boolean;
  isChecking: boolean;
  result: AnswerResponse | null;
  onCheck: () => void;
  onSkip: () => void;
  onContinue: () => void;
}

const positiveMessages = [
  "Nicely done!",
  "Amazing!",
  "Great job!",
  "Correct!",
  "Spot on!",
];

export function FeedbackBar({
  status,
  hasAnswer,
  isChecking,
  result,
  onCheck,
  onSkip,
  onContinue,
}: FeedbackBarProps) {
  const isFeedback = status === "feedback";
  const isCorrect = result?.is_correct ?? false;

  // Pick a random encouraging message on each correct answer
  const successMessage = useMemo(() => {
    return positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
  }, [result]);

  // Keyboard shortcut listener: Enter key triggers Check or Continue
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (isFeedback) {
          onContinue();
        } else if (hasAnswer && !isChecking) {
          onCheck();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFeedback, hasAnswer, isChecking, onCheck, onContinue]);

  // Format the display of the correct answer
  const formattedSolution = useMemo(() => {
    if (!result?.correct_answer) return "";
    if (typeof result.correct_answer === "string") return result.correct_answer;
    if (Array.isArray(result.correct_answer)) return result.correct_answer.join(" ");
    if (typeof result.correct_answer === "object") {
      return JSON.stringify(result.correct_answer);
    }
    return String(result.correct_answer);
  }, [result]);

  return (
    <footer
      className={[
        "fixed bottom-0 left-0 right-0 z-40 transition-all duration-200 border-t-2",
        isFeedback
          ? isCorrect
            ? "bg-[#d7ffb8] border-green-300 py-6 sm:py-8"
            : "bg-[#ffdfe0] border-red-300 py-6 sm:py-8"
          : "bg-white border-[#e5e5e5] py-5",
      ].join(" ")}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Left Side Info / Message */}
        {isFeedback ? (
          <div className="flex items-center gap-3.5 min-w-0">
            {isCorrect ? (
              <>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-duo-green shrink-0 shadow-xs">
                  <CheckCircle2 className="w-9 h-9 fill-duo-green text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-duo-green-dark tracking-tight">
                    {successMessage}
                  </h3>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-duo-red shrink-0 shadow-xs">
                  <XCircle className="w-9 h-9 fill-duo-red text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-black text-duo-red tracking-tight">
                    Correct solution:
                  </h3>
                  <p className="text-sm sm:text-base font-bold text-duo-red/90 truncate">
                    {formattedSolution}
                  </p>
                  {result?.explanation && (
                    <p className="text-xs text-duo-text mt-0.5">
                      {result.explanation}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Idle state left side: Skip button */
          <button
            type="button"
            disabled={isChecking}
            onClick={onSkip}
            className="px-5 py-3 rounded-2xl border-2 border-b-4 border-[#e5e5e5] hover:bg-gray-100 active:translate-y-0.5 active:border-b-2 font-extrabold text-sm uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-all select-none"
          >
            Skip
          </button>
        )}

        {/* Right Side Action Button */}
        <div>
          {isFeedback ? (
            <Button
              variant={isCorrect ? "primary" : "danger"}
              size="lg"
              onClick={onContinue}
              className="min-w-[150px]"
            >
              Continue
            </Button>
          ) : (
            <Button
              variant={hasAnswer ? "primary" : "locked"}
              size="lg"
              disabled={!hasAnswer || isChecking}
              onClick={onCheck}
              className="min-w-[150px]"
            >
              {isChecking ? "Checking..." : "Check"}
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
