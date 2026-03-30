"use client";

import { useState, useEffect } from "react";
import type { Topic } from "@/lib/types";
import { CategoryFilter } from "./category-filter";
import { getCategories } from "@/actions/get-categories";
import { getTopics } from "@/actions/get-topics";

interface TopicBrowserProps {
  currentTopicId: string;
  onSelectTopic: (topic: Topic) => void;
  onClose: () => void;
}

export function TopicBrowser({ currentTopicId, onSelectTopic, onClose }: TopicBrowserProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // 并行加载分类和话题
        const [cats, topicList] = await Promise.all([
          getCategories(),
          getTopics({ limit: 50 }),
        ]);

        setCategories(cats);
        setTopics(topicList);
      } catch (e) {
        setError("加载话题失败");
        console.error("Failed to load topics:", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 当分类改变时重新加载话题
  useEffect(() => {
    async function loadTopicsByCategory() {
      if (selectedCategory === null) {
        // 如果选择了"全部分类"，重新加载所有话题
        const allTopics = await getTopics({ limit: 50 });
        setTopics(allTopics);
      } else {
        const filtered = await getTopics({ category: selectedCategory, limit: 50 });
        setTopics(filtered);
      }
    }

    if (!loading) {
      loadTopicsByCategory();
    }
  }, [selectedCategory]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sb-border px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-lg">浏览话题</h2>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-sb-text-secondary transition-colors hover:bg-sb-bg-secondary hover:text-sb-text-primary"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-sb-text-secondary">加载中...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs text-sb-text-secondary underline hover:text-sb-text-primary"
              >
                重试
              </button>
            </div>
          ) : topics.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-sb-text-secondary">暂无话题</p>
            </div>
          ) : (
            <ul className="divide-y divide-sb-border">
              {topics.map((topic) => (
                <li key={topic.id}>
                  <button
                    onClick={() => onSelectTopic(topic)}
                    disabled={topic.id === currentTopicId}
                    className={`w-full px-6 py-4 text-left transition-colors ${
                      topic.id === currentTopicId
                        ? "bg-sb-bg-secondary cursor-default"
                        : "hover:bg-sb-bg-secondary"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{topic.title}</p>
                        {topic.description && (
                          <p className="mt-1 text-xs text-sb-text-secondary line-clamp-1">
                            {topic.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs text-sb-text-secondary">
                          {formatDate(topic.publish_date)}
                        </span>
                        {topic.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sb-bg-secondary text-sb-text-secondary">
                            {topic.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {topic.id === currentTopicId && (
                      <p className="mt-2 text-xs text-sb-text-secondary">当前话题</p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-sb-border px-6 py-3 bg-sb-bg-secondary">
          <p className="text-xs text-sb-text-secondary text-center">
            共 {topics.length} 个话题
            {selectedCategory && ` · ${selectedCategory}`}
          </p>
        </div>
      </div>
    </div>
  );
}
