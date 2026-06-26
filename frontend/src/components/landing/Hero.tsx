import { Sparkles, Flame, Brain, Calendar } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-20 px-8">

      <div className="max-w-5xl mx-auto text-center">

        {/* TOP PILL */}
        <div className="inline-flex items-center gap-2 bg-white border border-[#ebe5dc] rounded-full px-6 py-2 shadow-sm">

          <Sparkles
            size={18}
            className="text-[#7C5CFF]"
          />

          <span className="text-[#5f6475] font-medium">

            Your AI-powered DSA second brain

          </span>

        </div>

        {/* HEADING */}
        <h1 className="mt-10 text-[88px] leading-[0.95] font-black tracking-[-4px] text-[#101223]">

          Prepare for interviews
          <br />

          with{" "}

          <span className="bg-gradient-to-r from-[#7C5CFF] to-[#5127c7] bg-clip-text text-transparent">

            calm intelligence.

          </span>

        </h1>

        {/* SUBTEXT */}
        <p className="mt-10 text-[28px] leading-[1.7] text-[#5f6475] max-w-4xl mx-auto">

          AlgoMind turns hundreds of problems into a structured study OS —
          spotting patterns, surfacing weak topics, and reminding you to revise
          at exactly the right moment.

        </p>

        {/* BUTTONS */}
        <div className="mt-12 flex items-center justify-center gap-6">

          <button className="bg-[#7351F8] hover:bg-[#6846ef] transition-all text-white px-10 py-5 rounded-full text-xl font-semibold shadow-lg">

            Open your dashboard →

          </button>

          <button className="bg-white border border-[#e7e1d8] px-10 py-5 rounded-full text-xl font-semibold shadow-sm">

            See how it works

          </button>

        </div>

        {/* FEATURES */}
        <div className="mt-12 flex items-center justify-center gap-12 text-[#5f6475] text-lg">

          <div className="flex items-center gap-2">

            <Flame
              size={18}
              className="text-[#d17a2b]"
            />

            <span>Streak tracking</span>

          </div>

          <div className="flex items-center gap-2">

            <Brain
              size={18}
              className="text-[#7C5CFF]"
            />

            <span>AI weak-topic analysis</span>

          </div>

          <div className="flex items-center gap-2">

            <Calendar
              size={18}
              className="text-[#2767b8]"
            />

            <span>Spaced repetition</span>

          </div>

        </div>

      </div>

    </section>
  );
}