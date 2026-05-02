import { useState, useEffect } from "react";
import { Loader, Shield, Send, CheckCircle, Cpu } from "lucide-react";

const STEPS = [
  { id: "scan", label: "Scanning for PII…", icon: Shield, duration: 800 },
  { id: "mask", label: "Masking sensitive data…", icon: Shield, duration: 600 },
  { id: "process", label: "Processing with LLM…", icon: Cpu, duration: 0 },
  { id: "remap", label: "Remapping tokens…", icon: Send, duration: 400 },
];

export default function ProcessingVisualizer() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (activeStep >= STEPS.length - 1) return; // stay on "Processing" until response

    const timer = setTimeout(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, STEPS[activeStep].duration);

    return () => clearTimeout(timer);
  }, [activeStep]);

  return (
    <div className="processing-viz">
      <div className="processing-inner">
        <div className="message-avatar assistant">S</div>
        <div className="processing-steps">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isDone = i < activeStep;
            const isActive = i === activeStep;

            return (
              <div
                key={step.id}
                className={`processing-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
              >
                <div className={`processing-step-icon ${isActive ? "spinning" : ""}`}>
                  {isDone ? (
                    <CheckCircle size={16} />
                  ) : isActive ? (
                    <Loader size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                <span>{step.label}</span>
                <div className="processing-step-bar">
                  <div
                    className={`processing-step-bar-fill ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
                    style={{ width: isDone ? "100%" : isActive ? "60%" : "0%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
