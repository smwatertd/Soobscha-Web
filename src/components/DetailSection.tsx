import type { ReactNode } from 'react'

type DetailSectionProps = {
  title: string
  children: ReactNode
}

export const DetailSection = ({ title, children }: DetailSectionProps) => (
  <section className="detail-section">
    <h2>{title}</h2>
    {children}
  </section>
)
