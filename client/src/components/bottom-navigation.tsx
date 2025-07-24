import { useState } from "react";

export default function BottomNavigation() {
  const [activeTab, setActiveTab] = useState("search");

  const tabs = [
    { id: "search", label: "Search", icon: "search" },
    { id: "history", label: "History", icon: "history" },
    { id: "saved", label: "Saved", icon: "bookmark" },
    { id: "profile", label: "Profile", icon: "user" },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "search":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case "history":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "bookmark":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        );
      case "user":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border-t border-gray-200 sticky bottom-0">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-4 transition-colors ${
              activeTab === tab.id
                ? "text-[hsl(142,76%,36%)]"
                : "brand-gray hover:text-brand-dark"
            }`}
          >
            <div className="mb-1">
              {getIcon(tab.icon)}
            </div>
            <span className={`text-xs ${activeTab === tab.id ? "font-medium" : ""}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
