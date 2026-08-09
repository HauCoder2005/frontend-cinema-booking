"use client";

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Chọn ghế" },
  { number: 2, label: "Chọn Combo" },
  { number: 3, label: "Thanh toán" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full bg-[#0b0d10] border-b border-[#1f242d]/80 py-4 px-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between sm:justify-center sm:gap-12">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isDone = step.number < currentStep;

          return (
            <div key={step.number} className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-[#dc2626] text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]"
                      : isDone
                      ? "bg-[#1f2937] text-red-400 border border-red-950"
                      : "bg-[#151a22] text-slate-500 border border-[#262c36]"
                  }`}
                >
                  {isDone ? "✓" : step.number}
                </div>
                <span
                  className={`text-xs font-semibold tracking-wide uppercase ${
                    isActive
                      ? "text-white"
                      : isDone
                      ? "text-slate-300"
                      : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`hidden sm:block w-12 h-[1px] ml-4 ${
                    isDone ? "bg-red-800/60" : "bg-[#1f242d]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
