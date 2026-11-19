# auth.md

## Brownyx Cognitive Expansion Layer - Public Documentation Access

This is a documentation-only site. There are no runtime APIs, MCP servers, protected resources, or authentication services on this site.

### Agent Audience

This site is designed for AI agents and LLM-based systems seeking to understand the Brownyx Cognitive Expansion Layer (CEL) concept.

### Registration

No registration is required. All documentation is publicly accessible.

### Authentication

Not applicable. This site serves public documentation only.

### Protected Resources

None. OAuth and OpenID Connect discovery metadata are not applicable and are not published.

### Documentation Discovery

The [documentation catalog](.well-known/api-catalog.json) is a static Linkset of public pages, served as `application/json` by GitHub Pages. The historical extensionless `/.well-known/api-catalog` and `/.well-known/docs-api` paths remain compatibility aliases; their names do not imply an executable API.

GitHub Pages does not apply custom Content-Type headers from this repository. Use the JSON-suffixed catalog for discovery; the extensionless aliases are served as `application/octet-stream` on the current host. The optional `_headers` template can set `application/linkset+json` on a compatible host.

Optional browser WebMCP tools in the homepage can return the overview or find documentation links when the browser supports that API. They do not expose the private Brownyx runtime and are not a remote MCP endpoint.
