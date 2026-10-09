"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { resetProgress, simulateDay, updateSettings } from "@/lib/api";
import { useUser } from "@/context/UserContext";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

const goals = [10, 20, 30, 50];

export default function SettingsPage() {
  const { user, refresh } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name ?? "");
  const [goal, setGoal] = useState(user?.daily_goal_xp ?? 20);
  const [sound, setSound] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("duo_sound_enabled") !== "false";
    }
    return true;
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [prevUser, setPrevUser] = useState(user);

  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setName(user.name);
      setGoal(user.daily_goal_xp);
    }
  }
  async function save() {
    setBusy(true); setMessage("");
    try { await updateSettings({ name, daily_goal_xp: goal }); await refresh(); setMessage("Settings saved."); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Could not save settings."); }
    finally { setBusy(false); }
  }
  async function run(action: () => Promise<unknown>, done: string) {
    setBusy(true); setMessage("");
    try { await action(); await refresh(); setMessage(done); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Action failed."); }
    finally { setBusy(false); }
  }
  return <MainLayout><div className="mx-auto w-full max-w-xl space-y-5 px-4 py-7">
    <h1 className="text-3xl font-black text-duo-text-dark">Settings</h1>
    <Card className="space-y-4 p-5"><h2 className="font-black text-duo-text-dark">Account</h2><label className="block text-sm font-bold text-duo-text">Display name<input value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border-2 border-gray-200 p-3 bg-transparent text-duo-text-dark" /></label><Button disabled={busy} onClick={save}>Save account</Button></Card>
    <Card className="space-y-4 p-5"><h2 className="font-black text-duo-text-dark">Preferences</h2><div className="flex gap-2">{goals.map(n=><button key={n} onClick={()=>setGoal(n)} className={`rounded-xl border-2 px-4 py-2 font-bold ${goal===n?"border-green-500 bg-green-50 text-duo-green-dark":"border-gray-200"}`}>{n} XP</button>)}</div><label className="flex items-center gap-3 font-bold text-duo-text"><input type="checkbox" checked={sound} onChange={e=>{setSound(e.target.checked);localStorage.setItem("duo_sound_enabled",String(e.target.checked));}}/> Sound effects</label><Button disabled={busy} onClick={save}>Save preferences</Button></Card>
    <Card className="flex items-center justify-between p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </div>
        <div>
          <h2 className="font-black text-duo-text-dark">Dark Mode</h2>
          <p className="text-xs font-bold text-gray-500">
            {isDark ? "Dark theme active" : "Light theme active"}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-12 h-7 rounded-full p-0.5 transition-colors border-2 ${
          isDark ? "bg-duo-green border-duo-green-dark" : "bg-gray-200 border-gray-300"
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            isDark ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </Card>
    <Card className="space-y-3 p-5"><h2 className="font-black text-duo-text-dark">Developer</h2><Button disabled={busy} variant="secondary" onClick={()=>run(()=>simulateDay(1),"Advanced one simulated day.")}>Simulate next day</Button><Button disabled={busy} variant="secondary" onClick={()=>run(resetProgress,"Progress reset.")}>Reset progress</Button></Card>
    {message&&<p role="status" className="rounded-xl bg-blue-50 p-3 text-sm font-bold text-duo-blue">{message}</p>}
  </div></MainLayout>;
}

