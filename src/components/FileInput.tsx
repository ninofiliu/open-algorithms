import { useRef, useState } from "react";

export const FileInput = ({
  label = "Image",
  onChange,
}: {
  label?: string;
  onChange: (file: File) => unknown;
}) => {
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <label
      className={dragOver ? "FileInput dragOver" : "FileInput"}
      onDragLeave={(evt) => {
        if (evt.currentTarget.contains(evt.relatedTarget as Node | null))
          return;
        setDragOver(false);
      }}
      onDrop={(evt) => {
        evt.preventDefault();
        setDragOver(false);
        const input = inputRef.current;
        if (!input) return;
        const files = [...evt.dataTransfer.files].filter((file) =>
          file.type.startsWith("image/"),
        );
        if (!files.length) return;
        const transfer = new DataTransfer();
        for (const file of input.multiple ? files : files.slice(0, 1)) {
          transfer.items.add(file);
        }
        input.files = transfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }}
      onDragOver={(evt) => {
        evt.preventDefault();
        for (const item of evt.dataTransfer.items) {
          if (item.kind !== "file") continue;
          evt.dataTransfer.dropEffect = "copy";
          setDragOver(true);
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(evt) => {
          const file = evt.target.files?.[0];
          if (!file) return;
          onChange(file);
          setFileName(file.name ?? "");
        }}
      />
      <span>{label}: </span>
      {!fileName ? (
        <span>drop or click to select</span>
      ) : (
        <span>{fileName}</span>
      )}
    </label>
  );
};
