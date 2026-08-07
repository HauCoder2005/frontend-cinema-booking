interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Chọn ghế" },
  { number: 2, label: "Chọn Combo" },
  { number: 3, label: "Thanh toán" },
  { number: 4, label: "Hoàn thành" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-6">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step.number === currentStep
                  ? "bg-red-600 text-white"
                  : step.number < currentStep
                  ? "bg-gray-600 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {step.number}
            </div>
            <span
              className={`text-sm font-medium ${
                step.number === currentStep
                  ? "text-red-600"
                  : step.number < currentStep
                  ? "text-gray-400"
                  : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="w-8 h-0.5 bg-gray-700 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}
