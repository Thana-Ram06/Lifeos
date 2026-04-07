"use client";

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ── Theme ── */
type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: "dark",
  toggleTheme: () => {},
});
const useTheme = () => useContext(ThemeContext);

/* ── Types ── */
interface TimelineEntry {
  year: number;
  age: number;
  event: string;
  income: string;
  category: string;
}

interface SimulationResult {
  timeline: TimelineEntry[];
  summary: string;
  finalOutcome: string;
  keyMilestones: string[];
  challenges: string[];
}

/* ── Helpers ── */
function getCategoryColor(category: string) {
  switch (category) {
    case "career":    return "bg-blue-500";
    case "personal":  return "bg-purple-500";
    case "financial": return "bg-[#22c55e]";
    case "health":    return "bg-red-500";
    case "milestone": return "bg-yellow-500";
    case "challenge": return "bg-orange-500";
    default:          return "bg-[#888888]";
  }
}

function parseIncome(incomeStr: string) {
  const cleaned = incomeStr.replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/* ── Page ── */
export default function Home() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const preferred =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(preferred);
    document.documentElement.classList.toggle("dark", preferred === "dark");
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const [age, setAge] = useState("");
  const [goal, setGoal] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !goal) return;
    setIsPending(true);
    setError(false);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age: parseInt(age, 10), goal }),
      });
      if (!res.ok) throw new Error("API error");
      const data: SimulationResult = await res.json();
      setResult(data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError(true);
    } finally {
      setIsPending(false);
    }
  };

  const chartData =
    result?.timeline.map((entry) => ({
      age: entry.age,
      income: parseIncome(entry.income),
      rawIncome: entry.income,
    })) ?? [];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen w-full bg-background text-foreground font-sans transition-colors duration-200">

        {/* Navbar */}
        <header className="sticky top-0 z-50 w-full h-16 border-b border-border bg-background/90 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 md:px-10 h-full flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5">
              <img src="/logo.jpeg" alt="LifeOS logo" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-serif text-xl text-primary tracking-wide">LifeOS</span>
            </a>
            <div className="flex items-center gap-6">
              <a
                href="#about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </a>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === "dark" ? (
                      <Sun size={16} className="text-muted-foreground" />
                    ) : (
                      <Moon size={16} className="text-muted-foreground" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-3xl mx-auto px-6 md:px-10 pb-32">

          {/* Hero */}
          <section className="pt-32 pb-14 flex flex-col items-center text-center space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground border border-border rounded-full px-3 py-1 tracking-widest uppercase">
              AI Life Simulator
            </span>
            <h1 className="font-serif text-6xl md:text-7xl font-normal tracking-tight leading-[1.05]">
              See Your Life<br />Before It Happens
            </h1>
            <p className="text-muted-foreground text-lg font-light max-w-md leading-relaxed">
              Enter your age and goal. We simulate your future in seconds.
            </p>
          </section>

          {/* Input card */}
          <div className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden backdrop-blur-md">
            {/* Glow blobs */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent blur-2xl opacity-60 pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
            <form onSubmit={handleGenerate} className="relative z-10 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="age"
                  className="block text-xs font-medium text-muted-foreground tracking-widest uppercase"
                >
                  Your Age
                </label>
                <input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  className="w-full bg-transparent border border-border rounded-xl px-4 py-4 text-lg font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="goal"
                  className="block text-xs font-medium text-muted-foreground tracking-widest uppercase"
                >
                  Your Goal
                </label>
                <textarea
                  id="goal"
                  placeholder="What do you want most in this life?"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  required
                  rows={4}
                  className="w-full bg-transparent border border-border rounded-xl px-4 py-4 text-lg font-light text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || !age || !goal}
                className="w-full sm:w-auto bg-[#22C55E] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-base px-10 py-4 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isPending ? "Simulating your life..." : "Generate My Future"}
              </button>

              {error && (
                <p className="text-sm text-red-500 pt-1">
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </div>

          {/* Loading */}
          <AnimatePresence>
            {isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-24 flex justify-center"
              >
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="font-serif text-2xl text-muted-foreground tracking-wide"
                >
                  Simulating your life...
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && !isPending && (
              <motion.div
                ref={resultsRef}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-24 space-y-8"
              >
                {/* Summary */}
                <div className="rounded-xl border border-border p-6 space-y-3">
                  <h2 className="font-serif text-2xl md:text-3xl">Summary</h2>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                {/* Income chart */}
                <div className="rounded-xl border border-border p-6 space-y-5">
                  <h2 className="font-serif text-2xl md:text-3xl">Income Progression</h2>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                        <XAxis
                          dataKey="age"
                          stroke="#888"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `Age ${v}`}
                        />
                        <YAxis
                          stroke="#888"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `$${v / 1000}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === "dark" ? "#111" : "#fff",
                            borderColor: theme === "dark" ? "#1a1a1a" : "#e5e5e5",
                            color: theme === "dark" ? "#fff" : "#0a0a0a",
                            borderRadius: "12px",
                            fontSize: "13px",
                          }}
                          itemStyle={{ color: "#22C55E" }}
                          formatter={(_: number, __: string, props: { payload?: { rawIncome: string } }) => [
                            props.payload?.rawIncome ?? "",
                            "Income",
                          ]}
                          labelFormatter={(label) => `Age ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="income"
                          stroke="#22C55E"
                          strokeWidth={2}
                          dot={{ r: 3, fill: theme === "dark" ? "#0a0a0a" : "#fff", stroke: "#22C55E", strokeWidth: 2 }}
                          activeDot={{ r: 5, fill: "#22C55E" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Timeline */}
                <div className="rounded-xl border border-border p-6 space-y-8">
                  <h2 className="font-serif text-2xl md:text-3xl">Timeline</h2>
                  <div className="relative">
                    <div className="absolute left-[6px] top-2 bottom-2 w-px bg-border" />
                    <div className="space-y-8 pl-8">
                      {result.timeline.map((entry, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: "-80px" }}
                          transition={{ duration: 0.4, delay: index * 0.04 }}
                          className="relative"
                        >
                          <div
                            className={`absolute -left-8 top-[6px] w-3 h-3 rounded-full ${getCategoryColor(entry.category)} ring-4 ring-background`}
                          />
                          <div className="border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                                {entry.year} &middot; Age {entry.age}
                              </span>
                              <span className="font-mono text-xs text-[#22C55E]/80 font-medium">
                                {entry.income}
                              </span>
                            </div>
                            <p className="text-foreground font-light leading-relaxed text-sm">
                              {entry.event}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Milestones & Challenges */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-border p-6 space-y-4">
                    <h3 className="font-serif text-xl md:text-2xl">Milestones</h3>
                    <div className="space-y-3">
                      {result.keyMilestones.map((milestone, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: idx * 0.08 }}
                          className="flex items-start gap-3 text-muted-foreground font-light text-sm leading-relaxed"
                        >
                          <span className="text-[#22C55E] shrink-0 mt-[2px]">—</span>
                          <span>{milestone}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border p-6 space-y-4">
                    <h3 className="font-serif text-xl md:text-2xl">Challenges</h3>
                    <div className="space-y-3">
                      {result.challenges.map((challenge, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: idx * 0.08 }}
                          className="flex items-start gap-3 text-muted-foreground font-light text-sm leading-relaxed"
                        >
                          <span className="text-[#22C55E] shrink-0 mt-[2px]">—</span>
                          <span>{challenge}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Final Outcome */}
                <div className="rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/5 p-6 space-y-3">
                  <h2 className="font-serif text-2xl md:text-3xl">Final Outcome</h2>
                  <p className="text-lg font-light italic text-muted-foreground leading-relaxed">
                    {result.finalOutcome}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Landing sections ── */}
          <div id="about" className="mt-24 space-y-16">

            {/* What is LifeOS */}
            <div className="space-y-5 text-center pt-8 border-t border-border">
              <h2 className="font-serif text-3xl md:text-4xl">What is LifeOS?</h2>
              <p className="text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
                LifeOS is an AI-powered life simulation system that helps you visualize your future based on your current direction.
              </p>
              <p className="text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
                By combining your age, goals, and realistic growth patterns, it generates a structured timeline of your life — including milestones, income progression, and key turning points.
              </p>
              <p className="text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto italic">
                It&apos;s not just prediction — it&apos;s perspective.
              </p>
            </div>

            <div className="border-t border-border" />

            {/* How it works */}
            <section className="space-y-10">
              <h2 className="font-serif text-3xl md:text-4xl text-center">How it works</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { n: "01", title: "Define your starting point", desc: "Enter your current age and your life goal." },
                  { n: "02", title: "AI simulates your journey", desc: "The system generates a realistic life path based on patterns." },
                  { n: "03", title: "Visualize your future", desc: "Get a timeline with milestones, income growth, and events." },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="rounded-xl border border-border p-6 space-y-3">
                    <span className="font-serif text-3xl text-[#22C55E]/30 leading-none block">{n}</span>
                    <p className="font-medium text-foreground text-sm">{title}</p>
                    <p className="text-muted-foreground font-light text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="border-t border-border" />

            {/* Features */}
            <section className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl text-center">What you get</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "15-year timeline", sub: "A full decade and a half of your simulated life path." },
                  { label: "Income projection", sub: "Watch your earning power grow year by year." },
                  { label: "Key milestones", sub: "Career, relationships, and personal breakthroughs." },
                  { label: "Real challenges", sub: "Honest setbacks and obstacles you may face." },
                  { label: "No signup needed", sub: "Generate your future instantly, for free." },
                  { label: "AI-powered", sub: "Powered by state-of-the-art language models." },
                ].map(({ label, sub }) => (
                  <div key={label} className="rounded-xl border border-border p-5 space-y-1">
                    <p className="font-medium text-foreground text-sm">{label}</p>
                    <p className="text-muted-foreground font-light text-xs leading-relaxed">{sub}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="border-t border-border" />

            {/* Why LifeOS */}
            <section className="rounded-xl border border-border p-8 space-y-5 text-center">
              <h2 className="font-serif text-3xl md:text-4xl">Why LifeOS?</h2>
              <p className="text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
                Most people don&apos;t fail because they lack ability — they fail because they lack direction.
              </p>
              <p className="text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
                LifeOS gives you a clear perspective of what your future could look like, helping you make better decisions today.
              </p>
              <p className="text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto italic">
                Your future isn&apos;t fixed — but your direction matters.
              </p>
            </section>

            <div className="border-t border-border" />

            {/* FAQ */}
            <section className="space-y-8 pb-8">
              <h2 className="font-serif text-3xl md:text-4xl text-center">Frequently asked questions</h2>
              <div className="space-y-4">
                {[
                  { q: "Is this prediction accurate?", a: "No, it's a simulation based on patterns, not a guaranteed future." },
                  { q: "Do I need to sign up?", a: "No, you can use LifeOS instantly." },
                  { q: "Can I trust the results?", a: "Use it as guidance, not absolute truth." },
                ].map(({ q, a }) => (
                  <div key={q} className="rounded-xl border border-border p-5 space-y-2">
                    <p className="font-medium text-foreground text-sm">{q}</p>
                    <p className="text-muted-foreground font-light text-sm leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-24">
          <div className="max-w-3xl mx-auto px-6 md:px-10 py-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-500">
              &copy; 2026 All rights reserved
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-500">
              Made by{" "}
              <a
                href="https://x.com/anoinv?s=21"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:opacity-80 transition-opacity"
              >
                me
              </a>
            </span>
          </div>
        </footer>

      </div>
    </ThemeContext.Provider>
  );
}
