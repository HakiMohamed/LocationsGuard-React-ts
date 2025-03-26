import React, { useState, KeyboardEvent } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder = 'Ajouter un tag...' }) => {
  const [input, setInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Features prédéfinies
  const predefinedFeatures = [
    'Climatisation',
    'GPS',
    'Bluetooth',
    'Caméra de recul',
    'Toit ouvrant',
    'Sièges chauffants',
    'USB',
    'Régulateur de vitesse',
    'ABS',
    'Airbags'
  ];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input.trim());
    }
  };

  const addTag = (newTag: string) => {
    if (!tags.includes(newTag)) {
      onChange([...tags, newTag]);
    }
    setInput('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const filteredFeatures = predefinedFeatures.filter(
    feature => 
      !tags.includes(feature) && 
      feature.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="w-full relative">
      <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-white">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 p-1 hover:bg-blue-200 rounded-full"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </span>
        ))}
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full min-w-[120px] outline-none"
            placeholder={tags.length === 0 ? placeholder : ''}
          />
          {isDropdownOpen && (
            <button
              type="button"
              onClick={() => setIsDropdownOpen(false)}
              className="absolute flex bg-gray-400 items-center gap-1 top-[-80px] right-0 mt-2 mr-2 p-2 text-white hover:bg-gray-500 transition-colors duration-200 rounded-full"
            >
              <span className="text-sm font-medium">Fermer</span>
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown des features prédéfinies */}
      {isDropdownOpen && filteredFeatures.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-2  border-blue-500 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredFeatures.map((feature) => (
            <button
              key={feature}
              type="button"
              onClick={() => addTag(feature)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4 text-gray-400" />
              <span>{feature}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput; 