import React, { useState } from 'react';

interface EditModalProps {
  onConfirm: (value: string | undefined) => void;  // Changed to accept undefined
  onCancel: () => void;
  maxLength?: number;
  defaultValue?: string;
}

const EditModal: React.FC<EditModalProps> = ({
  onConfirm,
  onCancel,
  maxLength,
  defaultValue = ""
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value) {
      onConfirm(value);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="absolute left-0 border bg-secondary shadow-lg rounded-md py-2 px-2 z-10 w-full">
      <div className="flex">
        {maxLength ? (
          <input
            type="text"
            className="bg-primary/90 min-w-20 w-full py-0 text-sm border rounded px-1 min-h-0 text-ellipsis noclass leading-none"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={maxLength}
            autoFocus
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span className="text-sm text-gray-700">Delete?</span>
        )}
        <div className="flex">
          <button
            onClick={() => onConfirm(maxLength ? value : undefined)}
            className="px-1.5 rounded-xl text-green-600 hover:bg-green-50 text-lg"
            title="Confirm"
          >
            ✓
          </button>
          <button
            onClick={onCancel}
            className="px-1.5 rounded-xl text-cancel hover:bg-hoverDelete text-lg"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;