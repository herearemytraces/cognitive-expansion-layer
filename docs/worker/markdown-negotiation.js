// Optional asset-host Worker template. GitHub Pages does not execute this file.
// Deploy it only on a compatible host with an ASSETS binding after verification.
export default {
  async fetch(request, env) {
    const assetResponse = await env.ASSETS.fetch(request);
    if (!assetResponse.ok) return assetResponse;
    const contentType = assetResponse.headers.get('Content-Type') || '';
    const headers = new Headers(assetResponse.headers);
    const pathname = new URL(request.url).pathname.toLowerCase();
    if (shouldNoindex(pathname, contentType, request.headers.get('Accept') || '')) {
      headers.set('X-Robots-Tag', 'noindex, follow');
    }
    if (!contentType.toLowerCase().includes('text/html')) {
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
    }

    const vary = (headers.get('Vary') || '').split(',').map(value => value.trim()).filter(Boolean);
    if (!vary.some(value => value === '*' || value.toLowerCase() === 'accept')) {
      vary.push('Accept');
    }
    headers.set('Vary', vary.join(', '));

    if (!prefersMarkdown(request.headers.get('Accept') || '')) {
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
    }

    headers.set('Content-Type', 'text/markdown; charset=utf-8');
    // These describe the HTML representation and cannot validate transformed text.
    for (const header of ['Content-Length', 'Content-Encoding', 'ETag', 'Content-MD5', 'Digest', 'Content-Digest', 'Repr-Digest']) {
      headers.delete(header);
    }
    if (request.method === 'HEAD') {
      return new Response(null, { status: assetResponse.status, headers });
    }

    const markdown = htmlToMarkdown(await assetResponse.text(), request.url);
    headers.set('x-markdown-tokens', String(Math.ceil(markdown.length / 4)));
    return new Response(markdown, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
};

function prefersMarkdown(accept) {
  let markdownQuality = 0;
  let htmlQuality = 0;
  for (const item of accept.toLowerCase().split(',')) {
    const [mediaType, ...parameters] = item.trim().split(';');
    let quality = 1;
    for (const parameter of parameters) {
      const match = parameter.trim().match(/^q\s*=\s*(.+)$/);
      if (match) quality = Number(match[1]);
    }
    if (!Number.isFinite(quality) || quality < 0 || quality > 1) quality = 0;
    if (mediaType.trim() === 'text/markdown') markdownQuality = Math.max(markdownQuality, quality);
    if (mediaType.trim() === 'text/html') htmlQuality = Math.max(htmlQuality, quality);
  }
  return markdownQuality > 0 && markdownQuality >= htmlQuality;
}

function shouldNoindex(pathname, contentType, accept) {
  return pathname.startsWith('/.well-known/')
    || /\.(?:md|txt|json|jsonl|jsonld|xml|yaml|yml|pdf|csv)$/i.test(pathname)
    || (contentType.toLowerCase().includes('text/html') && prefersMarkdown(accept));
}

function decodeEntities(text) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  return text.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, name) => {
    if (name.startsWith('#')) {
      const hexadecimal = name[1].toLowerCase() === 'x';
      const codePoint = Number.parseInt(name.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
    }
    return named[name.toLowerCase()] || entity;
  });
}

function htmlToMarkdown(html, baseUrl) {
  let md = html.replace(/\r\n?/g, '\n');
  const preserved = [];
  const preserve = text => {
    const marker = `CEL_PRESERVED_${preserved.length}_END`;
    preserved.push(text);
    return marker;
  };
  const codeFence = text => '`'.repeat(Math.max(3, ...[...text.matchAll(/`+/g)].map(match => match[0].length + 1)));

  md = md.replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  const main = md.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (main) md = main[1];

  // Preserve code before collapsing source indentation and converting inline tags.
  md = md.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_, content) => {
    const language = content.match(/<code\b[^>]*class=["'][^"']*language-([\w+-]+)/i)?.[1] || '';
    const code = decodeEntities(content.replace(/<\/?code\b[^>]*>/gi, '').replace(/<[^>]+>/g, '')).replace(/^\n|\n$/g, '');
    const fence = codeFence(code);
    return `<p>${preserve(`${fence}${language}\n${code}\n${fence}`)}</p>`;
  });
  md = md.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_, content) => {
    const code = decodeEntities(content.replace(/<[^>]+>/g, '')).trim();
    const delimiter = '`'.repeat(Math.max(1, ...[...code.matchAll(/`+/g)].map(match => match[0].length + 1)));
    return preserve(`${delimiter}${code}${delimiter}`);
  });
  md = md.replace(/\s+/g, ' ');
  md = md.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, tag, text) => `**${text.trim()}**`)
    .replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, tag, text) => `*${text.trim()}*`);
  md = md.replace(/<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_, quote, href, text) => {
    const target = decodeEntities(href);
    const resolved = /^https?:\/\//i.test(target) ? target : new URL(target, baseUrl).href;
    return `[${text.trim()}](${resolved})`;
  });
  md = md.replace(/<img\b[^>]*>/gi, tag => {
    const source = tag.match(/\bsrc=(["'])(.*?)\1/i)?.[2];
    if (!source) return '';
    const alt = decodeEntities(tag.match(/\balt=(["'])(.*?)\1/i)?.[2] || '');
    const target = decodeEntities(source);
    const resolved = /^https?:\/\//i.test(target) ? target : new URL(target, baseUrl).href;
    return `![${alt}](${resolved})`;
  });
  md = md.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => `\n\n${'#'.repeat(Number(level))} ${text.trim()}\n\n`)
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => `\n- ${text.trim()}\n`)
    .replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => `\n\n> ${text.trim()}\n\n`)
    .replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => `\n\n${text.trim()}\n\n`)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, '\n\n---\n\n')
    .replace(/<\/(?:div|section|article|ul|ol)\s*>/gi, '\n\n');
  md = decodeEntities(md.replace(/<[^>]+>/g, ''));
  md = md.split('\n').map(line => line.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  md = md.replace(/CEL_PRESERVED_(\d+)_END/g, (_, index) => preserved[Number(index)]);
  return md + '\n';
}
