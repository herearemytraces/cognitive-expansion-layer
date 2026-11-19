# Optional DNS for AI Discovery (DNS-AID) Notes

## Overview

This is an optional operator planning document, not evidence that DNS-AID is
configured for the current site. GitHub Pages publishes this static documentation
site; this repository does not establish live DNS discovery or expose an A2A,
MCP, or authenticated runtime endpoint.

## Operator-Owned Setup

If DNS discovery is needed later, the domain operator should first identify the
actual public documentation resource and the applicable DNS-AID specification.
Publish only records describing deployed resources, and verify them through an
independent resolver. No DNS change is required to read the CEL documentation.

The [documentation catalog](docs-api) lists the public pages available now. Its
historical `api-catalog` aliases are documentation links, not runtime API discovery.

## References

- [DNS-AID Draft](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)
- [RFC 9460 - Service Binding](https://www.rfc-editor.org/rfc/rfc9460)
