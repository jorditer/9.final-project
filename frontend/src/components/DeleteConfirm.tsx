import { useRef, useEffect } from 'react';
import { Trash2 } from "lucide-react";

interface DeleteConfirmProps {
  id: string;
  showConfirm: string | null;
  setShowConfirm: (id: string | null) => void;
  onDelete: (id: string) => void;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  id,
  showConfirm,
  setShowConfirm,
  onDelete
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowConfirm(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowConfirm]);

  return showConfirm === id ? (
    <div 
      ref={modalRef}
      className="absolute right-8 top-1 border bg-secondary shadow-lg rounded-md py-2 px-3 z-10 whitespace-nowrap"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Delete?</span>
        <div className="flex">
          <button
            onClick={() => {
              onDelete(id);
              setShowConfirm(null);
            }}
            className="px-1.5 rounded-xl text-green-600 hover:bg-green-50 text-lg"
            title="Confirm"
          >
            ✓
          </button>
          <button
            onClick={() => setShowConfirm(null)}
            className="px-1.5 rounded-xl text-cancel hover:bg-hoverDelete text-lg"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default DeleteConfirm