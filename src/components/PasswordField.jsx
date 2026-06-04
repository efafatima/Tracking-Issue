"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/password";

export default function PasswordField({
  value,
  onChange,
  placeholder = "Password",
  showRules = false,
  autoComplete
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-stack">
      <div className="password-field">
        <input
          className="input"
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {showRules && (
        <div className="password-rules" aria-live="polite">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(value);
            return (
              <span key={rule.id} className={passed ? "rule-ok" : "rule-missing"}>
                {passed ? "✓" : "•"} {rule.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
