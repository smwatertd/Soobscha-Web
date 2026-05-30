import { Button, Flex, Typography } from 'antd'

type PaginationProps = {
  page: number
  totalCount?: number
  hasMore?: boolean
  onPageChange: (page: number) => void
}

export const Pagination = ({ page, totalCount, hasMore, onPageChange }: PaginationProps) => (
  <Flex justify="flex-end" align="center" gap={16} wrap style={{ marginTop: 18 }}>
    <Button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
      Назад
    </Button>
    <Typography.Text>
      Страница {page}
      {totalCount !== undefined ? `, всего ${totalCount}` : ''}
    </Typography.Text>
    <Button disabled={!hasMore} onClick={() => onPageChange(page + 1)}>
      Вперёд
    </Button>
  </Flex>
)
