export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "lowercase", label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { id: "uppercase", label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { id: "number", label: "One number", test: (value) => /\d/.test(value) },
  { id: "special", label: "One special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export function getPasswordIssues(password = "") {
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => rule.label);
}

export function validatePassword(password = "") {
  const issues = getPasswordIssues(password);
  return {
    valid: issues.length === 0,
    issues,
    message: issues.length ? `Password must include: ${issues.join(", ")}.` : "",
  };
}
