import type { Exercise, AnswerResponse } from "@/types";

export interface ExerciseProps {
  exercise: Exercise;
  value: unknown;
  onChange: (val: unknown) => void;
  disabled: boolean;
  result: AnswerResponse | null;
}
