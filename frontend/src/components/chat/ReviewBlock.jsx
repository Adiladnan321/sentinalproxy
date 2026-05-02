import { useState } from "react";
import { Loader2, PlusCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { sendFeedback } from "../../api/client";

export default function ReviewBlock({ prompt, data, onConfirm, onCancel, onReload }) {
  const { auth } = useAuth();
  const [selection, setSelection] = useState("");
  const [entityType, setEntityType] = useState("CUSTOM");
  const [loading, setLoading] = useState(false);

  // Safely escape HTML to prevent XSS
  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  let previewHtml = escapeHtml(data.masked_prompt);
  
  // Highlighting the tokens
  Object.entries(data.mapping).forEach(([token, original]) => {
    const escapedOriginal = escapeHtml(original);
    const escapedToken = escapeHtml(token);
    // Replace the token in the masked text with a nice highlight badge containing the original text
    const regex = new RegExp(escapedToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    previewHtml = previewHtml.replace(
      regex, 
      `<span class="review-highlight">${escapedOriginal} <span class="review-token-tag">${escapedToken}</span><button class="review-remove-mask" data-original="${escapedOriginal}" title="Don't mask this">✕</button></span>`
    );
  });

  function handleSelection() {
    const text = window.getSelection().toString().trim();
    if (text) {
      setSelection(text);
    }
  }

  async function handleRemoveRule(originalValue) {
    setLoading(true);
    try {
      // Mark as "Never Mask"
      await sendFeedback(auth.token, originalValue, false, "CUSTOM");
      if (onReload) await onReload();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleContainerClick(e) {
    const removeBtn = e.target.closest('.review-remove-mask');
    if (removeBtn) {
      const original = removeBtn.getAttribute('data-original');
      if (original) {
        handleRemoveRule(original);
      }
    }
  }

  async function handleAddRule() {
    if (!selection) return;
    setLoading(true);
    try {
      await sendFeedback(auth.token, selection, true, entityType);
      setSelection("");
      if (onReload) await onReload();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="review-block">
      <div className="review-block-header">
        <h3 className="review-block-title">Review & Mask</h3>
        <p className="review-instruction">
          Highlight any unrecognized sensitive text below to manually mask it, or click the ✕ on an existing mask to unmask it.
        </p>
      </div>
      
      <div 
        className="review-content-area" 
        onMouseUp={handleSelection}
        onClick={handleContainerClick}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />

      {selection && (
        <div className="review-selection-toolbar animate-in">
          <div className="review-selection-text">
            Mask <strong className="review-selection-highlight">"{selection}"</strong> as:
          </div>
          <div className="review-selection-controls">
            <select 
              className="review-select"
              value={entityType} 
              onChange={e => setEntityType(e.target.value)}
            >
              <option value="CUSTOM">CUSTOM</option>
              <option value="PERSON">PERSON</option>
              <option value="ORG">ORGANIZATION</option>
              <option value="LOC">LOCATION</option>
              <option value="EMAIL">EMAIL</option>
              <option value="PHONE">PHONE</option>
            </select>
            <button className="review-btn add" onClick={handleAddRule} disabled={loading}>
              {loading ? <Loader2 size={14} className="feedback-spinner"/> : <PlusCircle size={14}/>}
              Add Rule
            </button>
            <button className="review-btn cancel" onClick={() => setSelection("")}>Cancel</button>
          </div>
        </div>
      )}

      <div className="review-actions">
        <button className="review-action-btn cancel" onClick={onCancel}>
          Discard Message
        </button>
        <button className="review-action-btn confirm" onClick={() => onConfirm(prompt)}>
          <CheckCircle2 size={16} />
          Confirm & Send to LLM
        </button>
      </div>
    </div>
  );
}
