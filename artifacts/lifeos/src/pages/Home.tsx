import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerateSimulation } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Home() {
  const [age, setAge] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  
  const resultsRef = useRef<HTMLDivElement>(null);

  const generateSimulation = useGenerateSimulation({
    mutation: {
      onSuccess: () => {
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !goal) return;
    generateSimulation.mutate({
      data: {
        age: parseInt(age, 10),
        goal: goal
      }
    });
  };

  const isPending = generateSimulation.isPending;
  const result = generateSimulation.data;
  const error = generateSimulation.error;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "career": return "bg-[#3b82f6]";
      case "personal": return "bg-[#a855f7]";
      case "financial": return "bg-[#22c55e]";
      case "health": return "bg-[#ef4444]";
      case "milestone": return "bg-[#eab308]";
      case "challenge": return "bg-[#f97316]";
      default: return "bg-[#888888]";
    }
  };

  const parseIncome = (incomeStr: string) => {
    const cleaned = incomeStr.replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const chartData = result?.timeline.map(entry => ({
    age: entry.age,
    income: parseIncome(entry.income),
    rawIncome: entry.income
  })) || [];

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background text-foreground font-sans px-6 py-24 selection:bg-primary/30">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        {/* Header / Hero */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16 w-full">
          <div className="font-serif text-xl tracking-wide text-primary">LifeOS</div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-normal tracking-tight text-white leading-[1.1]">
            See Your Life<br/>Before It Happens
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl font-light tracking-wide max-w-md">
            Enter your age and goal. We simulate your future in seconds.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="w-full space-y-8 flex flex-col items-center">
          <div className="w-full space-y-6">
            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Current Age</label>
              <Input 
                id="age"
                type="number" 
                min="1"
                max="120"
                placeholder="e.g. 28" 
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                className="bg-transparent border-border text-2xl py-8 px-4 font-light focus-visible:ring-primary/50 text-center md:text-left transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="goal" className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Core Aspiration</label>
              <Textarea 
                id="goal"
                placeholder="What is the one thing you want most in this life?" 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)}
                className="bg-transparent border-border text-lg md:text-xl py-6 px-4 font-light min-h-[140px] resize-none focus-visible:ring-primary/50 transition-colors"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isPending || !age || !goal}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg px-12 py-7 rounded-full transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto mt-4"
          >
            {isPending ? "Simulating..." : "Generate Future"}
          </Button>

          {error && (
            <div className="text-destructive text-sm mt-4 p-4 border border-destructive/20 rounded-md bg-destructive/10 w-full text-center">
              Failed to simulate future. Please try again.
            </div>
          )}
        </form>

        {/* Loading State */}
        <AnimatePresence>
          {isPending && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-24 mb-32 flex flex-col items-center"
            >
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="font-serif text-2xl text-muted-foreground tracking-wider"
              >
                Simulating your life...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !isPending && (
            <motion.div 
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mt-32 space-y-24 pb-24"
            >
              <div className="space-y-6">
                <h2 className="font-serif text-4xl border-b border-border pb-6">Executive Summary</h2>
                <p className="text-lg text-muted-foreground leading-relaxed font-light">{result.summary}</p>
              </div>

              <div className="space-y-6">
                <h2 className="font-serif text-4xl border-b border-border pb-6">Income Progression</h2>
                <div className="h-[300px] w-full mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                      <XAxis 
                        dataKey="age" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `Age ${value}`}
                      />
                      <YAxis 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${(value / 1000)}k`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#1A1A1A', color: '#FFFFFF' }}
                        itemStyle={{ color: '#22C55E' }}
                        formatter={(value: number, name: string, props: any) => [props.payload.rawIncome, 'Income']}
                        labelFormatter={(label) => `Age ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#22C55E" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#0A0A0A', stroke: '#22C55E', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#22C55E', stroke: '#0A0A0A' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-12">
                <h2 className="font-serif text-4xl border-b border-border pb-6">Timeline</h2>
                <div className="relative pl-4 md:pl-0">
                  <div className="absolute left-[27px] md:left-[110px] top-4 bottom-4 w-px bg-border z-0"></div>
                  
                  <div className="space-y-12 relative z-10">
                    {result.timeline.map((entry, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="flex flex-col md:flex-row gap-6 md:gap-12"
                      >
                        <div className="flex items-center md:items-start md:w-[80px] shrink-0 pt-1">
                          <div className="font-mono text-sm text-muted-foreground tracking-tighter w-12 text-right">{entry.year}</div>
                          <div className={`w-3 h-3 rounded-full mx-4 md:ml-4 md:mr-0 shrink-0 ${getCategoryColor(entry.category)} ring-4 ring-background shadow-none`}></div>
                        </div>
                        <div className="flex-1 space-y-2 bg-transparent border border-border p-6 rounded-2xl ml-12 md:ml-0 hover:border-primary/50 transition-colors">
                          <div className="flex justify-between items-baseline mb-2">
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Age {entry.age}</span>
                            <span className="font-mono text-xs text-primary/80">{entry.income}</span>
                          </div>
                          <p className="text-foreground text-lg font-light leading-relaxed">{entry.event}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12 pt-12">
                <div className="space-y-6">
                  <h3 className="font-serif text-3xl pb-4 border-b border-border">Key Milestones</h3>
                  <div className="space-y-4">
                    {result.keyMilestones.map((milestone, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-5 border border-border rounded-xl text-muted-foreground font-light bg-transparent shadow-none"
                      >
                        {milestone}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-serif text-3xl pb-4 border-b border-border">Anticipated Challenges</h3>
                  <div className="space-y-4">
                    {result.challenges.map((challenge, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-5 border border-border rounded-xl text-muted-foreground font-light bg-transparent shadow-none"
                      >
                        {challenge}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-16 border-t border-border">
                <h2 className="font-serif text-4xl mb-6">Final Outcome</h2>
                <p className="text-xl text-foreground leading-relaxed font-light italic opacity-90">{result.finalOutcome}</p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
