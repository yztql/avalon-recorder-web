export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-title">阿瓦隆记录器</div>
      </header>
      <main className="page-container">{children}</main>
    </div>
  )
}