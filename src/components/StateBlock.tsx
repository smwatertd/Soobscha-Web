type StateBlockProps = {
  title: string
  description?: string
}

export const StateBlock = ({ title, description }: StateBlockProps) => (
  <div className="state-block">
    <strong>{title}</strong>
    {description ? <p>{description}</p> : null}
  </div>
)
