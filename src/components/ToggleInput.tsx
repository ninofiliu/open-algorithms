export const ToggleInput = ({
  label,
  value,
  onChange,
  onLabel = "on",
  offLabel = "off",
}: {
  label: string;
  value: boolean;
  onChange: (newValue: boolean) => unknown;
  onLabel?: string;
  offLabel?: string;
}) => {
  return (
    <div className="ToggleInput">
      <span>{label}: </span>
      <span
        className="ToggleInput-option"
        style={{
          opacity: value ? 1 : 0.5,
          color: value ? "var(--accent)" : "inherit",
        }}
        onClick={() => onChange(false)}
      >
        {offLabel}
      </span>
      <span
        className="ToggleInput-option"
        style={{
          opacity: !value ? 1 : 0.5,
          color: !value ? "var(--accent)" : "inherit",
        }}
        onClick={() => onChange(true)}
      >
        {onLabel}
      </span>
    </div>
  );
};
