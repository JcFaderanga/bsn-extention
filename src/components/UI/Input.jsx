import React from 'react'

const Input = ({type, value, onChange, placeholder}) => {
    return (
        <input
            className="bg-white w-full px-4 py-2 rounded-xl border border-gray-300 focus:bg-white focus:ring-2 focus:ring-black/80 outline-none transition"
            type={type || 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    );
}

export default Input
