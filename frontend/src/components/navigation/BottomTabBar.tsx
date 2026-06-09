"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenLine, Info, Search } from "lucide-react";

interface BottomTabBarProps {
  locale: string;
  translations: {
    home: string;
    register: string;
    activities: string;
    status: string;
  };
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  matchPaths: string[];
}

export function BottomTabBar({ locale, translations }: BottomTabBarProps) {
  const pathname = usePathname();

  const tabs: TabItem[] = [
    {
      id: "home",
      label: translations.home,
      icon: Home,
      href: `/`,
      matchPaths: [`/`],
    },
    {
      id: "register",
      label: translations.register,
      icon: PenLine,
      href: `/register`,
      matchPaths: [`/register`],
    },
    {
      id: "activities",
      label: translations.activities,
      icon: Info,
      href: `/activities`,
      matchPaths: [`/activities`],
    },
    {
      id: "status",
      label: translations.status,
      icon: Search,
      href: `/check-status`,
      matchPaths: [`/check-status`, `/status`],
    },
  ];

  const isActiveTab = (tab: TabItem): boolean => {
    return tab.matchPaths.some((path) => pathname === path);
  };

  return (
    <nav
      data-testid="bottom-tab-bar"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = isActiveTab(tab);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`
                flex flex-col items-center justify-center gap-1 
                min-h-[44px] min-w-[44px]
                transition-colors duration-200
                ${
                  isActive
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "font-semibold" : ""
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
