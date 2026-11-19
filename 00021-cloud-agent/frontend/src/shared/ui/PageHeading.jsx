export function PageHeading({ eyebrow, title, description, children }) {
  return <header className="page-heading">
    <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>
    {children}
  </header>;
}
