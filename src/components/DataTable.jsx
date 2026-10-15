import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

/**
 * DataTable Component
 * Sortable, filterable, paginated data table
 */
export const DataTable = ({
  columns,
  data = [],
  searchable = true,
  searchPlaceholder = 'Search records...',
  filterOptions = null, // e.g. { key: 'status', label: 'Status', options: ['all', 'healthy', 'warning', 'unhealthy'] }
  pageSize = 5,
  emptyMessage = 'No matching records found',
  emptySubMessage = 'Try refining your search terms or filters',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Search and filter handling
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Filter dropdown check
      if (filterOptions && selectedFilter !== 'all') {
        const itemVal = item[filterOptions.key];
        if (itemVal !== selectedFilter) return false;
      }

      // Search term check
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();

      return columns.some((col) => {
        const val = col.accessor ? item[col.accessor] : null;
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, selectedFilter, filterOptions, columns]);

  // Sorting handling
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const col = columns.find((c) => (c.accessor || c.id) === sortConfig.key);
      let aVal = col?.accessor ? a[col.accessor] : a[sortConfig.key];
      let bVal = col?.accessor ? b[col.accessor] : b[sortConfig.key];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return { key: null, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="data-table-container">
      {/* Controls Bar */}
      {(searchable || filterOptions) && (
        <div className="data-table-controls">
          {searchable && (
            <div className="data-table-search-box">
              <Search size={16} className="data-table-search-icon" />
              <input
                type="text"
                className="data-table-search-input"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="data-table-search-clear"
                  onClick={() => setSearchTerm('')}
                >
                  &times;
                </button>
              )}
            </div>
          )}

          {filterOptions && (
            <div className="data-table-filter-group">
              <label className="data-table-filter-label">{filterOptions.label}:</label>
              <select
                className="data-table-filter-select"
                value={selectedFilter}
                onChange={(e) => {
                  setSelectedFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                {filterOptions.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Table Element */}
      <div className="data-table-scroll-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const colKey = col.accessor || col.id;
                const isSorted = sortConfig.key === colKey;
                const sortable = col.sortable !== false;

                return (
                  <th
                    key={colKey}
                    className={`data-table-th ${sortable ? 'sortable' : ''}`}
                    onClick={() => sortable && handleSort(colKey)}
                    style={{ width: col.width || 'auto' }}
                  >
                    <div className="th-content">
                      <span>{col.header}</span>
                      {sortable && (
                        <span className="sort-icon">
                          {isSorted ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )
                          ) : (
                            <ChevronsUpDown size={14} className="sort-idle" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="data-table-tr">
                  {columns.map((col) => {
                    const colKey = col.accessor || col.id;
                    return (
                      <td key={colKey} className="data-table-td">
                        {col.cell ? col.cell(row) : row[col.accessor]}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="data-table-empty-td">
                  <EmptyState
                    title={emptyMessage}
                    message={emptySubMessage}
                    actionLabel={searchTerm || selectedFilter !== 'all' ? 'Reset Filters' : null}
                    onAction={resetFilters}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedData.length > pageSize && (
        <div className="data-table-pagination">
          <div className="pagination-info">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} records
          </div>

          <div className="pagination-buttons">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <span className="pagination-page-indicator">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
