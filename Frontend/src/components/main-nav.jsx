import { Link } from "react-router-dom"

export function MainNav() {
  return (
    <nav className="hidden md:flex gap-6">
      <Link to="/features" className="text-sm font-medium transition-colors hover:text-primary">
        Features
      </Link>
      <Link to="/pricing" className="text-sm font-medium transition-colors hover:text-primary">
        Pricing
      </Link>
      <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
        About
      </Link>
      <Link to="/contact" className="text-sm font-medium transition-colors hover:text-primary">
        Contact
      </Link>
    </nav>
  )
}

