const Material = () => {
  return (
    <div className="w-full h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 px-10 py-8 rounded-2xl shadow-xl bg-[#1f2937] border border-gray-700">
        {/* ICON */}
        <div className="text-6xl animate-pulse">🚧</div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-white tracking-wide">
          UNDER DEVELOPMENT
        </h1>

        {/* DESCRIPTION */}
        <p className="text-[13px] text-gray-300 text-center max-w-[350px] leading-relaxed">
          Material menu is currently under development and will be available
          soon.
        </p>

        {/* STATUS */}
        <div className="px-4 py-1 rounded-full bg-yellow-500/20 border border-yellow-400 text-yellow-300 text-[11px] font-semibold">
          IN PROGRESS DEVELOPMENT
        </div>
      </div>
    </div>
  );
};

export default Material;
