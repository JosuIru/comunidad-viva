import { useState } from 'react';

interface ArrayInputProps {
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function ArrayInput({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  className = '',
}: ArrayInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    // Case-insensitive duplicate check
    if (trimmed && !value.some(v => v.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && '*'}
      </label>

      {/* Display current items */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((item, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={`Eliminar ${item}`}
                className="p-1 -mr-1 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input for adding new items */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Añadir
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Escribe un elemento y presiona Enter o haz clic en &quot;Añadir&quot;
      </p>
    </div>
  );
}
