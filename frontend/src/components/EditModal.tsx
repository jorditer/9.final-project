import { useState, useEffect, useRef } from 'react';

interface EditModalProps {
 onConfirm: (value: string) => void;
 onCancel: () => void;
 maxLength: number;
 defaultValue: string;
}

const EditModal: React.FC<EditModalProps> = ({
 onConfirm,
 onCancel,
 maxLength,
 defaultValue = ""
}) => {
 const [value, setValue] = useState(defaultValue);
 const modalRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
       onCancel();
     }
   };
   document.addEventListener('mousedown', handleClickOutside);
   return () => {
     document.removeEventListener('mousedown', handleClickOutside);
   };
 }, [onCancel]);

 const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
   if (e.key === "Enter" && value) {
     onConfirm(value);
   } else if (e.key === "Escape") {
     onCancel();
   }
 };

 return (
   <div ref={modalRef} className="absolute left-0 border bg-secondary shadow-lg rounded-md py-2 px-2 z-10 w-full">
     <div className="flex">
       <input
         type="text"
         className="bg-primary/90 min-w-20 w-full py-0 text-sm border rounded px-1 min-h-0 text-ellipsis noclass leading-none"
         value={value}
         onChange={(e) => setValue(e.target.value)}
         maxLength={maxLength}
         autoFocus
         onKeyDown={handleKeyDown}
       />
       <div className="flex">
         <button
           onClick={() => onConfirm(value)}
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