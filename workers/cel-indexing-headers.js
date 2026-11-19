function isIndexableHomepage(request, response) {
  const url = new URL(request.url);
  const accept = request.headers.get('Accept') || '';
  return request.method === 'GET'
    && url.pathname === '/'
    && response.status === 200
    && (response.headers.get('Content-Type') || '').toLowerCase().includes('text/html')
    && !/text\/markdown/i.test(accept);
}

function addIndexingPolicy(request, response) {
  const headers = new Headers(response.headers);
  if (isIndexableHomepage(request, response)) {
    headers.delete('X-Robots-Tag');
  } else {
    headers.set('X-Robots-Tag', 'noindex, follow');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function createIndexingWorker(originFetch = fetch) {
  return {
    async fetch(request) {
      if (new URL(request.url).hostname !== 'cel.brownyx.com') {
        return new Response('Not found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex, follow' },
        });
      }
      const originResponse = await originFetch(request);
      return addIndexingPolicy(request, originResponse);
    },
  };
}

export default createIndexingWorker();
