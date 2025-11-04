import { TAB_CONFIG } from '../constants'

export const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <nav className="mb-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide sm:mb-6 sm:gap-6">
      {TAB_CONFIG.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`min-h-[44px] whitespace-nowrap pb-2.5 text-xs font-medium transition active:scale-95 sm:min-h-0 sm:pb-3 sm:text-sm ${
            activeTab === tab.id
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-200'
          }`}
        >
          {tab.label}
          {activeTab === tab.id ? (
            <span className="mt-2.5 block h-0.5 w-full rounded-full bg-accent sm:mt-3" />
          ) : (
            <span className="mt-2.5 block h-0.5 w-full rounded-full bg-transparent sm:mt-3" />
          )}
        </button>
      ))}
    </nav>
  )
}

