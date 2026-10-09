"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchLesson, submitAnswer, completeLesson, refillHearts, practiceHearts } from "@/lib/api";
import type {
  LessonDetail,
  Exercise,
  AnswerResponse,
  LessonCompleteResponse,
} from "@/types";
import { sounds } from "@/lib/sound";

export type SessionStatus =
  | "loading"
  | "in_exercise"
  | "feedback"
  | "hearts_empty"
  | "submitting"
  | "completed"
  | "error";

interface UseLessonSessionProps {
  lessonId: number;
  initialHearts?: number;
}

export function useLessonSession({
  lessonId,
  initialHearts = 5,
}: UseLessonSessionProps) {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lesson progress tracking
  const [totalInitialExercises, setTotalInitialExercises] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);

  // Hearts tracking
  const [hearts, setHearts] = useState(initialHearts);
  const [shakeHeart, setShakeHeart] = useState(false);

  // Current exercise state
  const [currentAnswer, setCurrentAnswer] = useState<unknown>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<AnswerResponse | null>(null);

  // Session status & completion payload
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("loading");
  const [completionData, setCompletionData] = useState<LessonCompleteResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Load lesson from server on mount
  const load = useCallback(async () => {
    setSessionStatus("loading");
    setErrorMessage(null);
    try {
      const data = await fetchLesson(lessonId);
      setLesson(data);
      setQueue(data.exercises);
      setTotalInitialExercises(data.exercises.length);
      setCurrentIndex(0);
      setCompletedCount(0);
      setMistakesCount(0);
      setCurrentAnswer(null);
      setCheckResult(null);
      setSessionStatus(data.exercises.length > 0 ? "in_exercise" : "completed");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load lesson"
      );
      setSessionStatus("error");
    }
  }, [lessonId]);

  useEffect(() => {
    let ignore = false;
    fetchLesson(lessonId)
      .then((data) => {
        if (ignore) return;
        setLesson(data);
        setQueue(data.exercises);
        setTotalInitialExercises(data.exercises.length);
        setCurrentIndex(0);
        setCompletedCount(0);
        setMistakesCount(0);
        setCurrentAnswer(null);
        setCheckResult(null);
        setSessionStatus(data.exercises.length > 0 ? "in_exercise" : "completed");
      })
      .catch((err) => {
        if (ignore) return;
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to load lesson"
        );
        setSessionStatus("error");
      });

    return () => {
      ignore = true;
    };
  }, [lessonId]);

  // Current active exercise in the queue
  const currentExercise = queue[currentIndex] || null;

  // Check if current answer is non-empty
  const hasAnswer = useMemo(() => {
    if (currentAnswer === null || currentAnswer === undefined) return false;
    if (typeof currentAnswer === "string") return currentAnswer.trim().length > 0;
    if (Array.isArray(currentAnswer)) return currentAnswer.length > 0;
    if (typeof currentAnswer === "object") return Object.keys(currentAnswer).length > 0;
    return false;
  }, [currentAnswer]);

  // 2. Submit exercise answer to server
  const submitCheck = useCallback(async () => {
    if (isChecking || !currentExercise || !hasAnswer) return;

    setIsChecking(true);
    try {
      const result = await submitAnswer(
        lessonId,
        currentExercise.id,
        currentAnswer
      );
      setCheckResult(result);

      if (result.is_correct) {
        sounds.playCorrect();
        setCompletedCount((prev) => prev + 1);
        setSessionStatus("feedback");
      } else {
        sounds.playIncorrect();
        setMistakesCount((prev) => prev + 1);
        setHearts(result.hearts_remaining);

        // Shake heart in header
        setShakeHeart(true);
        setTimeout(() => setShakeHeart(false), 800);

        // Re-append wrongly answered exercise to the end of the queue (Duolingo retry mechanic)
        setQueue((prevQueue) => [...prevQueue, currentExercise]);

        if (result.lesson_failed || result.hearts_remaining <= 0) {
          setSessionStatus("hearts_empty");
        } else {
          setSessionStatus("feedback");
        }
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Submission failed"
      );
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, currentExercise, hasAnswer, lessonId, currentAnswer]);

  // 3. Skip exercise (counts as wrong, appends to end of queue)
  const skipExercise = useCallback(async () => {
    if (isChecking || !currentExercise) return;
    setIsChecking(true);
    try {
      const result = await submitAnswer(
        lessonId,
        currentExercise.id,
        "__SKIPPED__"
      );
      setCheckResult(result);
      sounds.playIncorrect();
      setMistakesCount((prev) => prev + 1);
      setHearts(result.hearts_remaining);

      // Shake heart
      setShakeHeart(true);
      setTimeout(() => setShakeHeart(false), 800);

      // Re-append to queue
      setQueue((prevQueue) => [...prevQueue, currentExercise]);

      if (result.lesson_failed || result.hearts_remaining <= 0) {
        setSessionStatus("hearts_empty");
      } else {
        setSessionStatus("feedback");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Skip failed");
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, currentExercise, lessonId]);

  // 4. Continue to next exercise or complete lesson
  const continueNext = useCallback(async () => {
    // If more exercises in the queue
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((prev) => prev + 1);
      setCurrentAnswer(null);
      setCheckResult(null);
      setSessionStatus("in_exercise");
    } else {
      // Reached the end of the queue! Finish lesson on server
      setSessionStatus("submitting");
      try {
        const completeRes = await completeLesson(lessonId, mistakesCount);
        setCompletionData(completeRes);
        sounds.playComplete();
        setSessionStatus("completed");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to finalize lesson"
        );
        setSessionStatus("error");
      }
    }
  }, [currentIndex, queue.length, lessonId, mistakesCount]);

  // 5. Refill hearts when run out
  const refillAndResume = useCallback(async (method: "gems" | "practice" = "gems") => {
    try {
      const result = method === "practice" ? await practiceHearts() : await refillHearts();
      setHearts(result.hearts);
      setSessionStatus("feedback");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Hearts refill failed"
      );
    }
  }, []);

  return {
    lesson,
    currentExercise,
    currentIndex,
    totalExercises: totalInitialExercises,
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
    retryLoad: load,
  };
}
