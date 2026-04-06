import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerateSimulation } from "@workspace/api-client-react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/App";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Home() {
  const [age, setAge] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const resultsRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const generateSimulation = useGenerateSimulation({
    mutation: {
      onSuccess: () => {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      },
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !goal) return;
    generateSimulation.mutate({ data: { age: parseInt(age, 10), goal } });
  };

  const isPending = generateSimulation.isPending;
  const result = generateSimulation.data;
  const error = generateSimulation.error;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "career":     return "bg-blue-500";
      case "personal":   return "bg-purple-500";
      case "financial":  return "bg-[#22c55e]";
      case "health":     return "bg-red-500";
      case "milestone":  return "bg-yellow-500";
      case "challenge":  return "bg-orange-500";
      default:           return "bg-[#888888]";
    }
  };

  const parseIncome = (incomeStr: string) => {
    const cleaned = incomeStr.replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const chartData = result?.timeline.map((entry) => ({
    age: entry.age,
    income: parseIncome(entry.income),
    rawIncome: entry.income,
  })) || [];

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground font-sans">

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full h-16 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 md:px-10 h-full flex items-center justify-between">
          <span className="font-serif text-xl text-primary tracking-wide" data-testid="navbar-logo">
            LifeOS
          </span>
          <div className="flex items-center gap-6">
            <a
              href="#about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-about"
            >
              About
            </a>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
              aria-label="Toggle theme"
              data-testid="button-theme-toggle"
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

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-6 md:px-10 pb-32">

        {/* Hero */}
        <section className="pt-28 pb-16 flex flex-col items-center text-center space-y-6">
          <h1
            className="font-serif text-6xl md:text-8xl font-normal tracking-tight leading-[1.05]"
            data-testid="heading-hero"
          >
            See Your Life<br />Before It Happens
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-light max-w-md leading-relaxed">
            Enter your age and goal. We simulate your future in seconds.
          </p>
        </section>

        {/* Input form */}
        <form onSubmit={handleGenerate} className="space-y-5" data-testid="form-generate">
          <div className="space-y-2">
            <label htmlFor="age" className="block text-xs font-medium text-muted-foreground tracking-widest uppercase">
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
              data-testid="input-age"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="goal" className="block text-xs font-medium text-muted-foreground tracking-widest uppercase">
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
              data-testid="input-goal"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || !age || !goal}
            className="w-full sm:w-auto bg-[#22C55E] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-base px-10 py-4 rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            data-testid="button-generate"
          >
            {isPending ? "Simulating your life..." : "Generate My Future"}
          </button>

          {error && (
            <p className="text-sm text-destructive pt-1" data-testid="text-error">
              Something went wrong. Please try again.
            </p>
          )}
        </form>

        {/* Loading */}
        <AnimatePresence>
          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-24 flex justify-center"
              data-testid="loading-state"
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
              className="mt-24 space-y-20"
              data-testid="results-section"
            >
              {/* Summary */}
              <section className="space-y-4">
                <h2 className="font-serif text-3xl md:text-4xl border-b border-border pb-5" data-testid="heading-summary">
                  Summary
                </h2>
                <p className="text-muted-foreground text-lg font-light leading-relaxed">
                  {result.summary}
                </p>
              </section>

              {/* Income chart */}
              <section className="space-y-6">
                <h2 className="font-serif text-3xl md:text-4xl border-b border-border pb-5">
                  Income Progression
                </h2>
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="age"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `Age ${v}`}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${v / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                          borderRadius: "12px",
                          fontSize: "13px",
                        }}
                        itemStyle={{ color: "#22C55E" }}
                        formatter={(_value: number, _name: string, props: { payload?: { rawIncome: string } }) => [props.payload?.rawIncome ?? "", "Income"]}
                        labelFormatter={(label) => `Age ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#22C55E"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "hsl(var(--background))", stroke: "#22C55E", strokeWidth: 2 }}
                        activeDot={{ r: 5, fill: "#22C55E" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Timeline */}
              <section className="space-y-10">
                <h2 className="font-serif text-3xl md:text-4xl border-b border-border pb-5">
                  Timeline
                </h2>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[6px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-10 pl-8">
                    {result.timeline.map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.4, delay: index * 0.04 }}
                        className="relative"
                        data-testid={`timeline-entry-${index}`}
                      >
                        {/* Dot */}
                        <div className={`absolute -left-8 top-[6px] w-3 h-3 rounded-full ${getCategoryColor(entry.category)} ring-4 ring-background`} />

                        <div className="border border-border rounded-xl p-5 hover:border-primary/40 transition-colors">
                          <div className="flex justify-between items-baseline mb-3">
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                              {entry.year} &middot; Age {entry.age}
                            </span>
                            <span className="font-mono text-xs text-primary/80 font-medium">
                              {entry.income}
                            </span>
                          </div>
                          <p className="text-foreground font-light leading-relaxed">
                            {entry.event}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Milestones & Challenges */}
              <section className="grid md:grid-cols-2 gap-12">
                <div className="space-y-5">
                  <h3 className="font-serif text-2xl md:text-3xl border-b border-border pb-4">
                    Milestones
                  </h3>
                  <div className="space-y-3">
                    {result.keyMilestones.map((milestone, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: idx * 0.08 }}
                        className="border border-border rounded-xl p-4 text-muted-foreground font-light text-sm leading-relaxed"
                        data-testid={`card-milestone-${idx}`}
                      >
                        {milestone}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="font-serif text-2xl md:text-3xl border-b border-border pb-4">
                    Challenges
                  </h3>
                  <div className="space-y-3">
                    {result.challenges.map((challenge, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: idx * 0.08 }}
                        className="border border-border rounded-xl p-4 text-muted-foreground font-light text-sm leading-relaxed"
                        data-testid={`card-challenge-${idx}`}
                      >
                        {challenge}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Final outcome */}
              <section className="border-t border-border pt-12 pb-8">
                <h2 className="font-serif text-3xl md:text-4xl mb-5">Final Outcome</h2>
                <p className="text-xl font-light italic text-muted-foreground leading-relaxed" data-testid="text-final-outcome">
                  {result.finalOutcome}
                </p>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* About anchor */}
        <section id="about" className="mt-32 pt-16 border-t border-border">
          <h3 className="font-serif text-2xl mb-3">About LifeOS</h3>
          <p className="text-muted-foreground font-light text-sm leading-relaxed max-w-xl">
            LifeOS uses AI to generate a personalized 15-year life simulation based on your age and goals. 
            It is a thought experiment — a mirror that shows one possible version of your future to help you think clearly about the present.
          </p>
        </section>

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
              className="no-underline hover:underline hover:opacity-80 transition-opacity"
              data-testid="link-made-by"
            >
              Thana Ji
            </a>
          </span>
        </div>
      </footer>

    </div>
  );
}
