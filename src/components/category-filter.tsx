"use client";

import { useState, useRef, useEffect } from "react";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  className = "",
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (category: string | null) => {
    onSelectCategory(category);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-button border border-sb-border bg-white px-4 py-2 text-sm transition-colors duration-150 hover:bg-sb-bg-secondary"
      >
        <span>{selectedCategory ?? "全部分类"}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-sb-border bg-white py-1 shadow-lg">
          <button
            onClick={() => handleSelect(null)}
            className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-sb-bg-secondary ${
              selectedCategory === null ? "bg-sb-bg-secondary font-medium" : ""
            }`}
          >
            全部分类
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleSelect(category)}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-sb-bg-secondary ${
                selectedCategory === category ? "bg-sb-bg-secondary font-medium" : ""
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
