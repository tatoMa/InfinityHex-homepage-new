import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#F8F3E9',
          color: '#16181F',
          fontFamily: 'system-ui, -apple-system, "PingFang SC", sans-serif',
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div>
          <p style={{ fontSize: 13, letterSpacing: '.24em', color: '#666C7A' }}>404</p>
          <h1 style={{ fontSize: 34, margin: '10px 0 6px' }}>这一格是空的</h1>
          <p style={{ color: '#5A6070', margin: 0 }}>This hex is empty.</p>
          <p style={{ marginTop: 22 }}>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                borderRadius: 99,
                background: '#C8352B',
                color: '#FFF6F0',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              回到首页 / Back home
            </Link>
          </p>
        </div>
      </body>
    </html>
  )
}
