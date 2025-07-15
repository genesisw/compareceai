import { EventCategory } from "@/types";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const categories: { key: EventCategory | null; label: string }[] = [
  { key: null, label: "Todos" },
  { key: "PAGODE", label: "Pagode" },
  { key: "SERTANEJO", label: "Sertanejo" },
  { key: "TECHNO", label: "Techno" },
  { key: "FUNK", label: "Funk" },
  { key: "FORRÓ", label: "Forró" },
  { key: "ROCK", label: "Rock" },
  { key: "SAMBA", label: "Samba" },
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.key || 'all'}
          onClick={() => onCategoryChange(category.key)}
          className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-colors ${
            selectedCategory === category.key
              ? 'bg-roxo-magenta text-white'
              : 'bg-dark-surface text-gray-300 hover:bg-gray-600'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
