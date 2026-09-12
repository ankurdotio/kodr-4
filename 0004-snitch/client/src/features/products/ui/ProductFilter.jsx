import React from 'react'

export const ProductFilter = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSelectSortBy,
  totalResults = 0,
}) => {
  return (
    <div className="border-y border-hairline py-4 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Categories scrollable pill/tab bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase()
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-1.5 text-xs uppercase tracking-eyebrow whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-ink text-canvas font-medium'
                    : 'bg-surface text-ink-muted border border-hairline hover:border-ink hover:text-ink'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center justify-between md:justify-end gap-4 text-xs text-ink-muted">
          <span>{totalResults} {totalResults === 1 ? 'item' : 'items'}</span>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="uppercase tracking-eyebrow text-[11px] text-ink">
              Sort:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => onSelectSortBy(e.target.value)}
              className="bg-surface border border-hairline px-3 py-1.5 text-xs text-ink uppercase tracking-eyebrow focus:outline-none focus:border-ink"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
