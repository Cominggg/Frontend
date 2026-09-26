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
// withCanonical=false면 canonical을 넣지 않는다. 쿼리(?page=N)에 따라 JS가 canonical을 다르게
// 지정하는 페이지에서 원본 HTML의 canonical을 JS가 바꾸는 충돌(구글 가이드상 잘못된 구현)을 피하기 위함.
export function injectMeta(html, { title, description, url, image, withCanonical = true }) {
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
  if (withCanonical) out = out.replace('</head>', () => `  <link rel="canonical" href="${u}" />\n  </head>`)
  return out
}
