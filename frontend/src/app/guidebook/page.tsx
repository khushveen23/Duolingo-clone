"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { GUIDEBOOKS, UnitGuidebookData } from "@/data/guidebooks";
import { Mascot } from "@/components/lesson/Mascot";
import { Volume2, ArrowLeft, BookOpen, Lightbulb, CheckCircle2 } from "lucide-react";

function GuidebookContent() {
  const searchParams = useSearchParams();
  const unitParam = Number(searchParams.get("unit")) || 1;
  const [selectedUnit, setSelectedUnit] = useState<number>(unitParam in GUIDEBOOKS ? unitParam : 1);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [revealedTranslations, setRevealedTranslations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (unitParam in GUIDEBOOKS) {
      setSelectedUnit(unitParam);
    }
  }, [unitParam]);

  const currentGuidebook: UnitGuidebookData = GUIDEBOOKS[selectedUnit] || GUIDEBOOKS[1];

  const playSpeech = (text: string, id: string, lang = "es-ES") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;

    setActiveAudioId(id);
    utterance.onend = () => setActiveAudioId(null);
    utterance.onerror = () => setActiveAudioId(null);

    window.speechSynthesis.speak(utterance);
  };

  const toggleTranslation = (id: string) => {
    setRevealedTranslations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 pb-20">
      {/* ── Top Back Navigation ─────────────────────────────── */}
      <div className="mb-6">
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 font-black text-sm tracking-wider uppercase text-gray-400 hover:text-duo-text-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={3} />
          <span>Back</span>
        </Link>
      </div>

      {/* ── Unit Switcher Tabs ──────────────────────────────── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {Object.values(GUIDEBOOKS).map((gb) => {
          const isSelected = gb.unitOrder === selectedUnit;
          return (
            <button
              key={gb.unitId}
              type="button"
              onClick={() => setSelectedUnit(gb.unitOrder)}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0 border-2 ${
                isSelected
                  ? `${gb.themeColor.bg} text-white ${gb.themeColor.border} border-b-4 shadow-sm active:translate-y-0.5`
                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200/70"
              }`}
            >
              Unit {gb.unitOrder}
            </button>
          );
        })}
      </div>

      {/* ── Guidebook Header with Mascot ────────────────────── */}
      <div className="flex items-center gap-5 pb-6 mb-8 border-b-2 border-gray-200">
        <div className="w-20 h-20 shrink-0 flex items-center justify-center">
          <Mascot mood="happy" size={80} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-duo-text-dark tracking-tight">
            Unit {currentGuidebook.unitOrder} Guidebook
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">
            {currentGuidebook.unitDescription}
          </p>
        </div>
      </div>

      {/* ── KEY PHRASES SECTION ─────────────────────────────── */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-black tracking-widest text-[#1cb0f6] uppercase">
            KEY PHRASES
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-duo-text-dark tracking-tight mb-6">
          {currentGuidebook.keyPhrasesTitle}
        </h2>

        <div className="flex flex-col gap-4">
          {currentGuidebook.keyPhrases.map((phrase) => {
            const isPlaying = activeAudioId === phrase.id;
            const isRevealed = revealedTranslations[phrase.id] ?? true;

            return (
              <div
                key={phrase.id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border-2 border-[#e5e5e5] bg-white hover:border-gray-300 hover:shadow-sm transition-all"
              >
                {/* Phrase & Speaker Button */}
                <div className="flex items-start sm:items-center gap-3 flex-1">
                  <button
                    type="button"
                    onClick={() => playSpeech(phrase.phrase, phrase.id, phrase.audioLanguage)}
                    title="Listen to pronunciation"
                    className={`p-2.5 rounded-xl border-2 border-b-4 transition-all shrink-0 ${
                      isPlaying
                        ? "bg-[#1cb0f6] border-[#1899d6] text-white scale-95"
                        : "bg-blue-50 border-blue-200 text-[#1cb0f6] hover:bg-blue-100 active:translate-y-0.5 active:border-b-2"
                    }`}
                  >
                    <Volume2 className={`w-5 h-5 ${isPlaying ? "animate-pulse" : ""}`} />
                  </button>

                  <div className="flex-1">
                    <p
                      className="text-base sm:text-lg font-bold text-duo-text-dark leading-snug cursor-pointer select-text"
                      onClick={() => playSpeech(phrase.phrase, phrase.id, phrase.audioLanguage)}
                    >
                      <span className="border-b border-dashed border-gray-400/80 hover:border-duo-blue pb-0.5">
                        {phrase.phrase}
                      </span>
                    </p>

                    {/* Translation */}
                    {isRevealed && (
                      <p className="text-sm font-semibold text-gray-500 mt-1">
                        {phrase.translation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Toggle translation button */}
                <button
                  type="button"
                  onClick={() => toggleTranslation(phrase.id)}
                  className="self-end sm:self-center text-xs font-bold text-gray-400 hover:text-duo-blue transition-colors px-2 py-1 rounded-lg"
                >
                  {isRevealed ? "Hide translation" : "Show translation"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── GRAMMAR & TIPS SECTION ──────────────────────────── */}
      {currentGuidebook.grammarTips && currentGuidebook.grammarTips.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black tracking-widest text-[#58cc02] uppercase flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>GRAMMAR TIPS</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-duo-text-dark tracking-tight mb-6">
            Master the rules of Unit {currentGuidebook.unitOrder}
          </h2>

          <div className="flex flex-col gap-6">
            {currentGuidebook.grammarTips.map((tip) => (
              <div
                key={tip.id}
                className="p-6 rounded-3xl border-2 border-[#e5e5e5] bg-white shadow-sm hover:border-gray-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center text-duo-green shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-duo-text-dark">
                    {tip.title}
                  </h3>
                </div>

                <p className="text-sm font-bold text-gray-600 mb-2">
                  {tip.summary}
                </p>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  {tip.content}
                </p>

                {/* Table if available */}
                {tip.table && (
                  <div className="my-4 overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-xs font-black uppercase tracking-wider text-gray-500">
                        <tr>
                          {tip.table.headers.map((h, i) => (
                            <th key={i} className="px-4 py-3">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-semibold">
                        {tip.table.rows.map((row, rIndex) => (
                          <tr key={rIndex} className="hover:bg-gray-50/50">
                            {row.map((cell, cIndex) => (
                              <td
                                key={cIndex}
                                className={`px-4 py-3 ${
                                  cIndex === 0
                                    ? "font-bold text-duo-text-dark"
                                    : "text-gray-600"
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Examples */}
                {tip.examples && tip.examples.length > 0 && (
                  <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                      Examples
                    </span>
                    {tip.examples.map((ex, exIdx) => (
                      <div key={exIdx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-duo-green shrink-0" />
                        <span className="font-bold text-duo-text-dark">{ex.source}</span>
                        <span className="text-gray-400">—</span>
                        <span className="text-gray-600">{ex.target}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Ready to Practice Callout ────────────────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-black tracking-tight">Ready to test what you learned?</h4>
          <p className="text-xs font-semibold text-white/90 mt-0.5">
            Hop back into the learning path to practice exercises for this unit.
          </p>
        </div>
        <Link
          href="/learn"
          className="px-6 py-3 rounded-2xl bg-white text-duo-blue font-black text-sm uppercase tracking-wider border-b-4 border-blue-200 hover:bg-gray-50 active:translate-y-0.5 active:border-b-0 transition-all shrink-0"
        >
          Start Lesson
        </Link>
      </div>
    </div>
  );
}

export default function GuidebookPage() {
  return (
    <MainLayout>
      <Suspense
        fallback={
          <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
            <div className="h-20 rounded-3xl bg-gray-100 animate-pulse" />
            <div className="h-40 rounded-3xl bg-gray-100 animate-pulse" />
          </div>
        }
      >
        <GuidebookContent />
      </Suspense>
    </MainLayout>
  );
}
