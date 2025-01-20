import React, { useState, useRef, useEffect } from 'react';

const SearchBar = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputWidth, setInputWidth] = useState(60); // minimum width
  const hiddenSpanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hiddenSpanRef.current) {
      // Add a small buffer (20px) to prevent text from touching the edges
      const newWidth = Math.max(60, hiddenSpanRef.current.offsetWidth + 20);
      setInputWidth(newWidth);
    }
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return ( 
    <div className="relative">
      {/* Hidden span to measure text width */}
      <span
        ref={hiddenSpanRef}
        className="absolute invisible whitespace-pre px-2"
        aria-hidden="true"
      >
        {inputValue || 'Search...'}
      </span>
      
      {/* Actual input that grows */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Search..."
        className="opacity-90 border px-2 py-2 border-black text-base rounded-md fixed top-4 left-4 transition-all duration-200"
        style={{ width: `${inputWidth}px` }}
      />
    </div>
  );
};

	// <input className="outline-none  border border-black fixed top-4 left-4 text-base w-1/3 p-1 rounded-md opacity-70 focus:opacity-90 active:opacity-100" type="search" name="search" id="search" />
export default SearchBar;