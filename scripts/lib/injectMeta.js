// API 데이터(공연명 등)가 속성값에 그대로 들어가므로 따옴표·꺾쇠로 태그가 깨지거나
// 스크립트가 주입되지 않도록 이스케이프한다.
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function setMetaContent(html, attr, key, value) {
  const pattern = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`)
  if (pattern.test(html)) return html.replace(pattern, (_, open, close) => `${open}${value}${close}`)
  return html.replace('</head>', () => `  <meta ${attr}="${key}" content="${value}" />\n  </head>`)
}

// 빌드된 index.html의 head를 URL별 메타로 치환한다. canonical·og:image는 템플릿에 없으면 추가한다.
export function injectMeta(html, { title, description, url, image }) {
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const u = escapeHtml(url)

  let out = html.replace(/<title>[^<]*<\/title>/, () => `<title>${t}</title>`)
  out = setMetaContent(out, 'name', 'description', d)
  out = setMetaContent(out, 'property', 'og:title', t)
  out = setMetaContent(out, 'property', 'og:description', d)
  out = setMetaContent(out, 'property', 'og:url', u)
  out = setMetaContent(out, 'name', 'twitter:title', t)
  out = setMetaContent(out, 'name', 'twitter:description', d)
  if (image) out = setMetaContent(out, 'property', 'og:image', escapeHtml(image))
  out = out.replace('</head>', () => `  <link rel="canonical" href="${u}" />\n  </head>`)
  return out
}
