import React, { useState } from 'react';

const CharLength = ({setSubTab}) => {
  const [text, setText] = useState('');

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const limit = 255;
  const isExceeded = text.length > limit;

  const normalText = text.slice(0, limit);
  const exceededText = text.slice(limit);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Character Length Check</h3>

      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Enter your text here..."
        className="w-full p-2 border h-52 border-gray-300 rounded"
        rows={6}
      />

      {/* Character Counter */}
      <p className={`text-sm mt-2 ${isExceeded ? 'text-red-500' : 'text-gray-600'}`}>
        {text.length}/255 characters
      </p>

      {/* Live Preview */}
      <div className="mt-4 p-3 border rounded bg-gray-50 min-h-[80px] whitespace-pre-wrap break-words">
        <span>{normalText}</span>
        {isExceeded && (
          <span className="text-red-500">{exceededText}</span>
        )}
      </div>
    </div>
  );
};

export default CharLength;
