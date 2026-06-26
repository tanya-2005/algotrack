import { Bell, Moon, Search } from "lucide-react";

export default function Topbar() {
  return (
    <div className="flex items-center justify-between bg-white border border-[#ece7df] rounded-[28px] px-6 py-4 shadow-sm">

      {/* Search */}
      <div className="flex items-center gap-3 bg-[#f6f3ef] px-4 py-3 rounded-full w-[60%]">
        <Search className="text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search problems, patterns, notes..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        <button className="w-11 h-11 rounded-full border border-[#ece7df] flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </button>

        <button className="w-11 h-11 rounded-full border border-[#ece7df] flex items-center justify-center">
          <Moon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 bg-white border border-[#ece7df] px-4 py-2 rounded-full">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#5B3DF5] to-[#B57DFF]" />
          <span className="font-medium">Tanya</span>
        </div>

      </div>
    </div>
  );
}