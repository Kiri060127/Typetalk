'use client';

import { mbtiTypes, getMbtiColor } from '@/lib/mbti-data';

interface MbtiTagBarProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

export default function MbtiTagBar({ selectedType, onSelectType }: MbtiTagBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectType('')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selectedType === ''
            ? 'bg-gray-800 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        全部
      </button>
      {mbtiTypes.map((type) => (
        <button
          key={type}
          onClick={() => onSelectType(type === selectedType ? '' : type)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            type === selectedType
              ? getMbtiColor(type)
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}
