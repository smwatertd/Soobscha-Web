import { Link, type LinkProps } from 'react-router-dom'

type AppNavLinkProps = LinkProps & {
  bold?: boolean
}

export const AppNavLink = ({ className, bold = false, ...props }: AppNavLinkProps) => (
  <Link
    className={['app-nav-link', bold ? 'app-nav-link--bold' : '', className].filter(Boolean).join(' ')}
    {...props}
  />
)
