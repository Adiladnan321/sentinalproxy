import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function ModelSelector({ models, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="model-selector" ref={ref}>
      <button
        id="model-selector-btn"
        className="model-selector-btn"
        onClick={() => setOpen((v) => !v)}
      >
        {selected || "Select model"}
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="model-dropdown">
          {models.map((m) => (
            <button
              key={m}
              className={`model-option ${m === selected ? "active" : ""}`}
              onClick={() => {
                onSelect(m);
                setOpen(false);
              }}
            >
              {m}
              {m === selected && (
                <span className="model-option-check"><Check size={14} /></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
