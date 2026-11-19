import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { test } from 'node:test';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const siteRoot = path.join(root, 'docs');
const origin = 'https://cel.brownyx.com';
const read = (name) => readFile(path.join(root, name), 'utf8');

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.filter((entry) => entry.name !== '.git').map(async (entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(target) : [target];
  }));
  return files.flat().sort();
}

async function assertLocalTarget(href, baseFile) {
  if (/^(?:mailto:|data:)/i.test(href)) return;
  let target;
  if (/^https?:/i.test(href)) {
    const url = new URL(href);
    if (url.origin !== origin) return;
    target = path.join(siteRoot, decodeURIComponent(url.pathname));
  } else {
    const pathname = decodeURIComponent(href.split(/[?#]/)[0]);
    if (!pathname) return;
    target = pathname.startsWith('/')
      ? path.join(siteRoot, pathname)
      : path.resolve(path.dirname(baseFile), pathname);
  }
  assert.ok(target.startsWith(`${root}${path.sep}`) || target === root, `Link escapes repository: ${href}`);
  const info = await stat(target).catch(() => null);
  assert.ok(info, `Missing target ${href} in ${path.relative(root, baseFile)}`);
  if (info.isDirectory()) await stat(path.join(target, 'index.html'));
}

const html = await read('docs/index.html');
const tools = new Map();
const browserScripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter((match) => !/\btype\s*=\s*["']application\/ld\+json["']/i.test(match[1]));
for (const [, , source] of browserScripts) {
  vm.runInNewContext(source, {
    navigator: { modelContext: { registerTool: (tool) => tools.set(tool.name, tool) } },
    console,
  }, { timeout: 1000 });
}

test('all Markdown links and published HTML assets resolve locally', async () => {
  for (const file of await filesIn(root)) {
    const content = await readFile(file, 'utf8');
    if (file.endsWith('.md')) {
      for (const [, href] of content.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
        await assertLocalTarget(href, file);
      }
    } else if (file.endsWith('.html')) {
      for (const [, , href] of content.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/g)) {
        await assertLocalTarget(href, file);
      }
      const ids = new Set([...content.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map((match) => match[1]));
      for (const [, anchor] of content.matchAll(/\bhref\s*=\s*["']#([^"']+)["']/g)) {
        assert.ok(ids.has(anchor), `Missing HTML anchor #${anchor}`);
      }
    }
  }
});

test('sitemap and LLM summary point only to existing published resources', async () => {
  const sitemap = await read('docs/sitemap.xml');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, href]) => href);
  assert.deepEqual(locations, [`${origin}/`], 'Only the public CEL homepage is selected for search');
  for (const href of locations) {
    assert.equal(new URL(href).origin, origin);
    await assertLocalTarget(href, path.join(siteRoot, 'sitemap.xml'));
  }
  const summary = await read('docs/llms.txt');
  for (const [, href] of summary.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    await assertLocalTarget(href, path.join(siteRoot, 'llms.txt'));
  }
  assert.ok(summary.includes('/implementation-status.md'));
});

test('the CEL homepage stays indexable and technical files have a response-header policy', async () => {
  assert.match(html, /<meta\s+name="robots"\s+content="index, follow"\s*>/i);
  const headers = await read('docs/_headers');
  for (const pattern of ['/*.md', '/*.txt', '/*.json', '/*.xml', '/.well-known/*']) {
    assert.ok(headers.includes(pattern), `Missing response-header rule for ${pattern}`);
  }
  assert.match(headers, /X-Robots-Tag:\s*noindex, follow/i);
});

test('documentation discovery catalogs use Linkset relationship properties', async () => {
  for (const name of ['api-catalog', 'api-catalog.json', 'docs-api']) {
    const file = path.join(siteRoot, '.well-known', name);
    const catalog = JSON.parse(await readFile(file, 'utf8'));
    assert.ok(Array.isArray(catalog.linkset) && catalog.linkset.length > 0);
    for (const context of catalog.linkset) {
      assert.equal(typeof context.anchor, 'string');
      assert.ok(!Object.hasOwn(context, 'rel'), `${name} uses the obsolete nested rel shape`);
      const relations = Object.entries(context).filter(([key]) => key !== 'anchor');
      assert.ok(relations.length > 0);
      for (const [relation, targets] of relations) {
        assert.ok(Array.isArray(targets), `${name}: ${relation} must be an array`);
        for (const target of targets) {
          assert.equal(typeof target.href, 'string');
          await assertLocalTarget(target.href, file);
        }
      }
    }
  }
});

test('public discovery does not advertise absent authenticated services or placeholder skills', async () => {
  assert.doesNotMatch(html, /rel=["'](?:authorization|resource-metadata|openid-configuration)["']/i);
  for (const file of await filesIn(path.join(siteRoot, '.well-known'))) {
    const content = await readFile(file, 'utf8');
    if (file.endsWith('.json')) JSON.parse(content);
    assert.doesNotMatch(content, /sha256:placeholder/);
    if (file.endsWith('.json')) {
      const data = JSON.parse(content);
      assert.ok(!data.authorization_endpoint && !data.token_endpoint && !data.transport?.endpoint,
        `Documentation-only discovery advertises an executable service: ${path.relative(root, file)}`);
    }
  }
});

test('canonical repository identity is consistent across the publication', async () => {
  for (const file of await filesIn(root)) {
    if (file === fileURLToPath(import.meta.url)) continue;
    assert.doesNotMatch(await readFile(file, 'utf8'), /github\.com\/VNemchenko\/cognitive-expansion-layer/i,
      `Old repository owner in ${path.relative(root, file)}`);
  }
});

test('repository manifest includes every publication file and no absent files', async () => {
  const declared = [...(await read('MANIFEST.md')).matchAll(/^- `([^`]+)`/gm)].map((match) => match[1]).sort();
  const actual = (await filesIn(root)).map((file) => path.relative(root, file).split(path.sep).join('/'));
  assert.deepEqual(declared, actual.sort());
});

test('browser documentation tools register and all listed documents exist', async () => {
  assert.ok(tools.has('get_cel_overview'));
  assert.ok(tools.has('search_cel_docs'));
  const docs = await tools.get('list_cel_docs').execute({});
  assert.ok(Array.isArray(docs) && docs.some((doc) => doc.url.endsWith('/implementation-status.md')));
  for (const doc of docs) await assertLocalTarget(doc.url, path.join(siteRoot, 'index.html'));
});

for (const [query, expected] of [
  ['architecture', 'Architecture'],
  ['scope', 'Implementation Boundaries'],
  ['Implementation Boundaries', 'Implementation Boundaries'],
  ['  ARCHITECTURE  ', 'Architecture'],
  ['implementation status', 'Implementation Status'],
]) {
  test(`browser search finds documentation for ${JSON.stringify(query)}`, async () => {
    const result = await tools.get('search_cel_docs').execute({ query });
    assert.ok(Array.isArray(result) && result.some((doc) => doc.title === expected));
  });
}

for (const params of [{ query: 'unlisted-topic-123' }, { query: '' }, {}, { query: null }, { query: 17 }]) {
  test(`browser search handles unmatched or invalid input ${JSON.stringify(params)}`, async () => {
    const result = await tools.get('search_cel_docs').execute(params);
    assert.ok(result && typeof result.message === 'string');
  });
}

const workerSource = await read('docs/worker/markdown-negotiation.js');
const worker = (await import(`data:text/javascript;base64,${Buffer.from(workerSource).toString('base64')}`)).default;
const indexingWorkerSource = await read('workers/cel-indexing-headers.js');
const indexingWorkerModule = await import(`data:text/javascript;base64,${Buffer.from(indexingWorkerSource).toString('base64')}`);
const negotiate = (accept, response, pathname = '/') => worker.fetch(
  new Request(`${origin}${pathname}`, { headers: { Accept: accept } }),
  { ASSETS: { fetch: async () => response } },
);

test('optional Markdown worker preserves headings, links and code blocks', async () => {
  const content = '<!doctype html><html><head><title>Title</title></head><body>'
    + '<h1>\n Brownyx <a href="https://brownyx.com">CEL</a>\n</h1>'
    + '<p>A <strong>bounded</strong> layer.</p><pre><code>const x = 1;\nconst y = 2;</code></pre></body></html>';
  const response = await negotiate('text/markdown', new Response(content, { headers: { 'Content-Type': 'text/html' } }));
  const markdown = await response.text();
  assert.match(markdown, /^# Brownyx \[CEL\]\(https:\/\/brownyx\.com\)/);
  assert.match(markdown, /```\nconst x = 1;\nconst y = 2;\n```/);
  assert.doesNotMatch(markdown, /<\/?(?:html|head|body|h1|script)\b/);
});

test('optional Markdown worker preserves headers and varies HTML as well as Markdown by Accept', async () => {
  for (const accept of ['text/markdown', 'text/html']) {
    const response = await negotiate(accept, new Response('<h1>CEL</h1>', { headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=60',
      'Link': '</llms.txt>; rel="describedby"',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Accept-Encoding',
      'ETag': '"html-body"',
    } }));
    assert.equal(response.headers.get('Cache-Control'), 'public, max-age=60');
    assert.equal(response.headers.get('Link'), '</llms.txt>; rel="describedby"');
    assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
    const vary = response.headers.get('Vary').toLowerCase().split(',').map((item) => item.trim());
    assert.ok(vary.includes('accept') && vary.includes('accept-encoding'));
    if (accept === 'text/markdown') {
      assert.match(response.headers.get('Content-Type'), /^text\/markdown/);
      assert.equal(response.headers.get('ETag'), null, 'Transformed content must not reuse the HTML validator');
    } else assert.equal(await response.text(), '<h1>CEL</h1>');
  }
});

test('optional Markdown worker leaves non-HTML and failed responses intact', async () => {
  for (const [type, status, body] of [['text/markdown', 200, '# CEL'], ['text/html', 404, 'Not found']]) {
    const response = await negotiate('text/markdown', new Response(body, { status, headers: { 'Content-Type': type } }));
    assert.equal(response.status, status);
    assert.equal(await response.text(), body);
  }
});

test('optional Markdown worker marks machine files and Markdown negotiation noindex', async () => {
  const markdownAsset = await negotiate('text/html', new Response('# Technical resource', {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  }), '/architecture.md');
  assert.equal(markdownAsset.status, 200);
  assert.equal(markdownAsset.headers.get('X-Robots-Tag'), 'noindex, follow');
  assert.equal(await markdownAsset.text(), '# Technical resource');

  const catalog = await negotiate('text/html', new Response('{}', {
    headers: { 'Content-Type': 'application/json' },
  }), '/.well-known/api-catalog.json');
  assert.equal(catalog.headers.get('X-Robots-Tag'), 'noindex, follow');
  assert.equal(await catalog.text(), '{}');

  const htmlAsset = new Response('<h1>Public homepage</h1>', {
    headers: { 'Content-Type': 'text/html' },
  });
  const homepage = await negotiate('text/html', htmlAsset.clone(), '/');
  assert.equal(homepage.headers.get('X-Robots-Tag'), null);
  const markdownView = await negotiate('text/markdown', htmlAsset, '/');
  assert.equal(markdownView.headers.get('X-Robots-Tag'), 'noindex, follow');
});

test('Cloudflare indexing worker proxies unchanged responses and indexes only the HTML homepage', async () => {
  const originResponses = new Map();
  const requests = [];
  const indexingWorker = indexingWorkerModule.createIndexingWorker(async (request) => {
    requests.push(request);
    const response = originResponses.get(new URL(request.url).pathname);
    assert.ok(response, `Unexpected origin request for ${request.url}`);
    return response;
  });

  const homeRequest = new Request(`${origin}/`, { headers: { Accept: 'text/html' } });
  originResponses.set('/', new Response('<html><head><title>CEL</title></head><body>Home</body></html>', {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
      'X-Robots-Tag': 'noindex',
    },
  }));
  const home = await indexingWorker.fetch(homeRequest);
  assert.equal(requests[0], homeRequest, 'The original request reaches the origin unchanged');
  assert.equal(home.status, 200);
  assert.equal(home.headers.get('Content-Type'), 'text/html; charset=utf-8');
  assert.equal(home.headers.get('Cache-Control'), 'public, max-age=60');
  assert.equal(home.headers.get('X-Robots-Tag'), null, 'The public HTML homepage is indexable');
  assert.equal(await home.text(), '<html><head><title>CEL</title></head><body>Home</body></html>');

  const workerPreview = await indexingWorker.fetch(new Request('https://cel-indexing-headers.vitalik648.workers.dev/'));
  assert.equal(workerPreview.status, 404, 'The unbound workers.dev endpoint does not proxy arbitrary hosts');
  assert.equal(workerPreview.headers.get('X-Robots-Tag'), 'noindex, follow');
  assert.equal(await workerPreview.text(), 'Not found');

  for (const [url, accept, contentType, status, body, statusText] of [
    [`${origin}/architecture.md`, 'text/markdown', 'text/markdown; charset=utf-8', 200, '# Architecture', ''],
    [`${origin}/.well-known/api-catalog.json`, 'application/json', 'application/json; charset=utf-8', 200, '{}', ''],
    [`${origin}/not-found`, 'text/html', 'text/html; charset=utf-8', 404, 'Not found', 'Not Found'],
  ]) {
    const pathname = new URL(url).pathname;
    const request = new Request(url, { headers: { Accept: accept } });
    originResponses.set(pathname, new Response(body, { status, statusText, headers: { 'Content-Type': contentType } }));
    const response = await indexingWorker.fetch(request);
    assert.equal(response.status, status, `${pathname} keeps its origin status`);
    assert.equal(response.statusText, statusText);
    assert.equal(response.headers.get('Content-Type'), contentType);
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, follow');
    assert.equal(await response.text(), body, `${pathname} keeps its origin body`);
  }

  const markdownHomeRequest = new Request(`${origin}/`, { headers: { Accept: 'text/markdown' } });
  originResponses.set('/', new Response('# CEL', { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } }));
  const markdownHome = await indexingWorker.fetch(markdownHomeRequest);
  assert.equal(markdownHome.status, 200);
  assert.equal(markdownHome.headers.get('X-Robots-Tag'), 'noindex, follow');
  assert.equal(await markdownHome.text(), '# CEL');
});
