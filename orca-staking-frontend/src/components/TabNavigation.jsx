import { TAB_CONFIG } from '../constants'

export const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <nav className="mb-4 flex items-center gap-3 overflow-x-auto border-b border-border/60 sm:mb-6 sm:gap-6">
      {TAB_CONFIG.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`whitespace-nowrap pb-2.5 text-xs font-medium transition sm:pb-3 sm:text-sm ${
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

