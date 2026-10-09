import React from "react";

interface MascotProps {
  mood?: "happy" | "excited" | "sad" | "talking" | "celebrating";
  size?: number;
  className?: string;
}

export function Mascot({
  mood = "happy",
  size = 120,
  className = "",
}: MascotProps) {
  return (
    <div
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Feet */}
        <ellipse cx="38" cy="90" rx="9" ry="4" fill="#ff9600" />
        <ellipse cx="62" cy="90" rx="9" ry="4" fill="#ff9600" />

        {/* Main Body */}
        <ellipse cx="50" cy="52" rx="38" ry="36" fill="#58cc02" />

        {/* Belly Patch (Lighter Green) */}
        <ellipse cx="50" cy="62" rx="26" ry="22" fill="#8ee000" />

        {/* Feathers on head */}
        <path
          d="M 44 16 C 44 8, 48 10, 50 16 C 52 10, 56 8, 56 16 Z"
          fill="#58cc02"
        />

        {/* Wings */}
        {mood === "celebrating" || mood === "excited" ? (
          <>
            {/* Raised Wings */}
            <path
              d="M 16 48 C 6 36, 10 24, 22 36 C 18 42, 16 46, 16 48 Z"
              fill="#58a700"
            />
            <path
              d="M 84 48 C 94 36, 90 24, 78 36 C 82 42, 84 46, 84 48 Z"
              fill="#58a700"
            />
          </>
        ) : (
          <>
            {/* Side Wings */}
            <path
              d="M 14 52 C 10 62, 14 74, 24 66 C 18 60, 15 55, 14 52 Z"
              fill="#58a700"
            />
            <path
              d="M 86 52 C 90 62, 86 74, 76 66 C 82 60, 85 55, 86 52 Z"
              fill="#58a700"
            />
          </>
        )}

        {/* Eyes (White Outer) */}
        <circle cx="37" cy="45" r="14" fill="#ffffff" />
        <circle cx="63" cy="45" r="14" fill="#ffffff" />

        {/* Eye Outline Rings */}
        <circle cx="37" cy="45" r="14" stroke="#58a700" strokeWidth="2" />
        <circle cx="63" cy="45" r="14" stroke="#58a700" strokeWidth="2" />

        {mood === "sad" ? (
          <>
            {/* Sad pupils looking down */}
            <circle cx="37" cy="49" r="6" fill="#4b4b4b" />
            <circle cx="63" cy="49" r="6" fill="#4b4b4b" />
            {/* Sad Drooping Eyebrows */}
            <path
              d="M 26 35 Q 37 42 46 38"
              stroke="#3c3c3c"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 74 35 Q 63 42 54 38"
              stroke="#3c3c3c"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tear Drop */}
            <path
              d="M 27 54 C 27 50, 31 46, 31 54 C 31 57, 27 57, 27 54 Z"
              fill="#1cb0f6"
            />
          </>
        ) : (
          <>
            {/* Happy / Normal Pupils */}
            <circle cx="38" cy="44" r="6.5" fill="#4b4b4b" />
            <circle cx="62" cy="44" r="6.5" fill="#4b4b4b" />
            {/* Pupil Glint Highlights */}
            <circle cx="36" cy="42" r="2.5" fill="#ffffff" />
            <circle cx="60" cy="42" r="2.5" fill="#ffffff" />

            {/* Cheerful Eyebrows */}
            <path
              d="M 27 34 Q 37 30 46 34"
              stroke="#3c3c3c"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 73 34 Q 63 30 54 34"
              stroke="#3c3c3c"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}

        {/* Orange Beak */}
        {mood === "sad" ? (
          <path
            d="M 44 56 Q 50 52 56 56 Q 50 63 44 56 Z"
            fill="#ff9600"
            stroke="#e08500"
            strokeWidth="1.5"
          />
        ) : mood === "excited" || mood === "celebrating" ? (
          <path
            d="M 43 53 Q 50 49 57 53 Q 50 67 43 53 Z"
            fill="#ff9600"
            stroke="#e08500"
            strokeWidth="1.5"
          />
        ) : (
          <path
            d="M 44 52 Q 50 48 56 52 Q 50 62 44 52 Z"
            fill="#ff9600"
            stroke="#e08500"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </div>
  );
}
