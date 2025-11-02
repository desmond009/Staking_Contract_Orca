import { TAB_CONFIG } from '../constants'

export const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <nav className="mb-6 flex items-center gap-6 border-b border-border/60">
      {TAB_CONFIG.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`pb-3 text-sm font-medium transition ${
            activeTab === tab.id
              ? 'text-white'
              : 'text-gray-500 hover:text-gray-200'
          }`}
        >
          {tab.label}
          {activeTab === tab.id ? (
            <span className="mt-3 block h-0.5 w-full rounded-full bg-accent" />
          ) : (
            <span className="mt-3 block h-0.5 w-full rounded-full bg-transparent" />
          )}
        </button>
      ))}
    </nav>
  )
}

