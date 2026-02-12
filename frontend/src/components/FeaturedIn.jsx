import { FEATURED_IN } from "../data/mock";

export const FeaturedIn = () => {
  return (
    <section className="py-12 bg-white border-y border-stone-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <span className="text-stone-400 text-xs font-semibold uppercase tracking-[0.2em] block mb-8">
            As Featured In
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {FEATURED_IN.map((outlet, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity duration-300"
              >
                <span
                  className={`font-bold tracking-tight text-stone-800 ${
                    outlet.type === "newspaper"
                      ? "text-lg"
                      : outlet.type === "tv"
                      ? "text-base"
                      : "text-base italic"
                  }`}
                  style={{
                    fontFamily:
                      outlet.type === "newspaper"
                        ? "'Playfair Display', Georgia, serif"
                        : outlet.type === "tv"
                        ? "'Inter', sans-serif"
                        : "'Playfair Display', Georgia, serif",
                  }}
                >
                  {outlet.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
