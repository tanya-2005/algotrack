import { Moon } from "lucide-react";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 px-10 pt-6">

      <div className="max-w-7xl mx-auto bg-white border border-[#ece7de] rounded-[28px] px-8 py-4 shadow-sm flex items-center justify-between">

        {/* LOGO */}
        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2B145A] to-[#7C5CFF]" />

          <h1 className="text-3xl font-black tracking-tight">
            Algo
            <span className="text-[#7C5CFF]">
              Mind
            </span>
          </h1>

        </div>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-14 text-[18px] text-[#5e6477] font-medium">

          <a href="#">Features</a>

          <a href="#">AI Insights</a>

          <a href="#">Revision</a>

          <a href="#">Loved by</a>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          <button className="w-12 h-12 rounded-full border border-[#e6e1d8] flex items-center justify-center bg-white">

            <Moon size={22} />

          </button>

          <button className="bg-[#7351F8] hover:bg-[#6846ef] transition-all px-8 py-3 rounded-full text-white font-semibold text-lg shadow-md">

            Open app

          </button>

        </div>

      </div>

    </div>
  );
}