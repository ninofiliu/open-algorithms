import { useState } from "react";

// Characters the user is allowed to type: optional minus, digits, optional dot
const ALLOWED = /^-?\d*\.?\d*$/;

// Returns null for intermediate states like "", "-", "." or "-."
const parse = (text: string) => {
  const n = Number(text);
  if (text === "" || !Number.isFinite(n)) return null;
  return n + 0; // turns -0 into 0
};

export const NumberInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (newValue: number) => unknown;
}) => {
  // The text is kept locally so the user can pass through invalid states
  // (empty, "-", "1.") without them being pushed to the parent
  const [draft, setDraft] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);

  // Sync when the parent changes the value, unless the draft already means it
  if (value !== prevValue) {
    setPrevValue(value);
    if (parse(draft) !== value) setDraft(String(value));
  }

  return (
    <label className="NumberInput">
      <span>{label}: </span>
      <input
        type="text"
        inputMode="decimal"
        value={draft}
        onChange={(evt) => {
          const text = evt.target.value.replace(",", ".");
          if (!ALLOWED.test(text)) return;
          setDraft(text);
          const n = parse(text);
          if (n !== null && n !== value) onChange(n);
        }}
        onBlur={() => setDraft(String(value))}
      />
    </label>
  );
};
