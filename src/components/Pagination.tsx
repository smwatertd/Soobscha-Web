type PaginationProps = {
  page: number
  totalCount?: number
  hasMore?: boolean
  onPageChange: (page: number) => void
}

export const Pagination = ({ page, totalCount, hasMore, onPageChange }: PaginationProps) => (
  <div className="pagination">
    <button className="button secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
      Назад
    </button>
    <span>
      Страница {page}
      {totalCount !== undefined ? `, всего ${totalCount}` : ''}
    </span>
    <button className="button secondary" disabled={!hasMore} onClick={() => onPageChange(page + 1)}>
      Вперёд
    </button>
  </div>
)
