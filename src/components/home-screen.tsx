"use client";

import { useState } from "react";
import type { Topic, Stance } from "@/lib/types";
import { CategoryFilter } from "./category-filter";

interface HomeScreenProps {
  topic: Topic;
  categories: string[];
  selectedCategory: string | null;
  onSelectStance: (stance: Stance) => void;
  onViewHistory: () => void;
  onViewStats: () => void;
  onBrowseTopics: () => void;
  onSelectCategory: (category: string | null) => void;
}

export function HomeScreen({
  topic,
  categories,
  selectedCategory,
  onSelectStance,
  onViewHistory,
  onViewStats,
  onBrowseTopics,
  onSelectCategory,
}: HomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <h1 className="font-serif text-3xl tracking-tight">S.B.</h1>
        <p className="mt-1 text-sm text-sb-text-secondary">Smart Brain</p>

        <div className="mt-16">
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-sb-text-secondary">今日辩题</p>
            {categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={onSelectCategory}
              />
            )}
          </div>
          <h2 className="mt-3 font-serif text-2xl leading-snug">
            「{topic.title}」
          </h2>
          {topic.description && (
            <p className="mt-3 text-sm leading-relaxed text-sb-text-secondary">
              {topic.description}
            </p>
          )}
          {topic.category && (
            <div className="mt-4">
              <span className="inline-block rounded-full bg-sb-bg-secondary px-3 py-1 text-xs text-sb-text-secondary">
                {topic.category}
              </span>
            </div>
          )}
        </div>

        <div className="mt-12 flex gap-4">
          <button
            onClick={() => onSelectStance("for")}
            className="flex-1 rounded-button border border-sb-border bg-white px-6 py-3 text-sm font-medium transition-colors duration-150 hover:bg-sb-bg-secondary"
          >
            正方 👍
          </button>
          <button
            onClick={() => onSelectStance("against")}
            className="flex-1 rounded-button border border-sb-border bg-white px-6 py-3 text-sm font-medium transition-colors duration-150 hover:bg-sb-bg-secondary"
          >
            反方 👎
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onBrowseTopics}
            className="text-xs text-sb-text-secondary underline hover:text-sb-text-primary"
          >
            浏览话题
          </button>
          <button
            onClick={onViewHistory}
            className="text-xs text-sb-text-secondary underline hover:text-sb-text-primary"
          >
            历史记录
          </button>
          <button
            onClick={onViewStats}
            className="text-xs text-sb-text-secondary underline hover:text-sb-text-primary"
          >
            战绩统计
          </button>
        </div>
      </div>
    </div>
  );
}
