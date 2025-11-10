import {
  IndexPath,
  Select,
  SelectItem,
  SelectProps,
} from "@ui-kitten/components";
import React from "react";

export type LabeledOption = { label: string; value: string };

type GenericSelectProps = {
  options: LabeledOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  status?: SelectProps["status"];
  caption?: SelectProps["caption"];
  disabled?: boolean;
};

export const GenericSelect: React.FC<GenericSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select",
  status,
  caption,
  disabled = false,
}) => {
  const selectedIdx = options.findIndex((o) => o.value === value);
  const [selectedIndex, setSelectedIndex] = React.useState<IndexPath>(
    selectedIdx >= 0 ? new IndexPath(selectedIdx) : new IndexPath(0)
  );

  return (
    <Select
      selectedIndex={selectedIndex}
      value={options[selectedIndex.row].label}
      onSelect={(index) => {
        const row = Array.isArray(index) ? index[0].row : index.row;
        const next = options[row];
        if (next) {
          onChange(next.value);
          setSelectedIndex(new IndexPath(row));
        }
      }}
      placeholder={placeholder}
      status={status}
      caption={caption}
      disabled={disabled}
    >
      {options.map((opt) => (
        <SelectItem key={opt.value} title={opt.label} />
      ))}
    </Select>
  );
};
