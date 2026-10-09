"use client";

import React, { useState } from "react";
import type { PathData, SkillNode as SkillNodeType } from "@/types";
import { UnitHeader } from "./UnitHeader";
import { SkillNode } from "./SkillNode";
import { SkillPopover } from "./SkillPopover";
import { Award, Gift, Sparkles } from "lucide-react";

interface PathViewProps {
  path: PathData;
}

export function PathView({ path }: PathViewProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillNodeType | null>(null);

  if (!path.units || path.units.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Sparkles className="w-12 h-12 text-duo-green mb-3 animate-spin" />
        <h3 className="font-extrabold text-lg text-duo-text-dark">No units available</h3>
        <p className="text-sm text-gray-400">Your learning tree will appear here soon.</p>
      </div>
    );
  }

  // Find the first available skill across all units to highlight as "next up"
  let nextUpFound = false;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6">
      {path.units.map((unit, unitIdx) => (
        <section key={unit.id} className="mb-14">
          {/* Unit Header Banner */}
          <UnitHeader unit={unit} unitIndex={unitIdx} />

          {/* Unit Skills Column with serpentine path layout */}
          <div className="flex flex-col items-center relative py-2">
            {unit.skills.map((skill, skillIdx) => {
              let isNextUp = false;
              if (!nextUpFound && skill.status === "available") {
                isNextUp = true;
                nextUpFound = true;
              }

              return (
                <SkillNode
                  key={skill.id}
                  skill={skill}
                  index={skillIdx}
                  isNextUp={isNextUp}
                  onSelect={(s) => setSelectedSkill(s)}
                />
              );
            })}

            {/* Unit Milestone / Chest at the end of the unit */}
            <div className="my-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-500 shadow-sm hover:scale-105 transition-transform cursor-pointer">
                <Gift className="w-8 h-8 fill-amber-400 text-amber-600" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-600 mt-2">
                Unit {unit.order} Milestone
              </span>
            </div>
          </div>
        </section>
      ))}

      {/* Interactive Skill Popover when a skill is clicked */}
      {selectedSkill && (
        <SkillPopover
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </div>
  );
}
