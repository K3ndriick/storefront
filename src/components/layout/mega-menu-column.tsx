import Link from 'next/link'

type MegaMenuLink = {
  href: string
  label: string
}

type MegaMenuColumnProps = {
  title: string
  links: MegaMenuLink[]
}

export function MegaMenuColumn({ title, links }: MegaMenuColumnProps) {
  return (
    <div>
      <h3 className="font-bold text-foreground mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
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