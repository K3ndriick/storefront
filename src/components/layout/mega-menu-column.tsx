import Link from 'next/link'

type MegaMenuLink = {
  href: string
  label: string
}

type MegaMenuColumnProps = {
  title: string
  titleHref?: string
  links: MegaMenuLink[]
}

export function MegaMenuColumn({ title, titleHref, links }: MegaMenuColumnProps) {
  return (
    <div>
      {/* Column Title - Clickable if titleHref provided */}
      {titleHref ? (
        <Link href={titleHref}>
          <h3 className="font-bold text-foreground mb-4 hover:underline underline-offset-2">
            {title}
          </h3>
        </Link>
      ) : (
        <h3 className="font-bold text-foreground mb-4">{title}</h3>
      )}
      
      {/* Column Links */}
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link 
              href={link.href} 
              className="text-sm text-foreground hover:underline underline-offset-2 transition-all inline-block py-1.5"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}