# Cloudflare Workers enabled Web-Vitals

---

<p align="center"><strong>WORK IN PROGRESS</strong></p>

<p align="center"><strong>Status:</strong> Functional, but incomplete.</p>

---

This is my submission for [Cloudflare Developer Summer Challenge](https://challenge.developers.cloudflare.com/). It's a
[web-vitals](https://web.dev/vitals/) tracking system at the edge.

![demo](/shots/demo.png)

### How?

Housed in 3 parts:

- the api [/workers/api](/workers/api) responsible for;
  - handling ingress `signals` — aka the metric's name and value
  - handling egress "dashboard" requests for [/site](/site) — deployed under
    [app.vitals.htm.io](https://app.vitals.htm.io/) [example](https://app.vitals.htm.io/sEkoUVWBfy2BlYAi)
- a cron worker [/workers/aggregation-cron](/workers/aggregation-cron) and is responsible for;
  - running every interval to collect all 'un-processed' entities and inserting into KV.
- a [site](/site) which is a [Cloudflare Pages](https://pages.cloudflare.com/) hosted SPA.

### Tech stack:

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Workers KV](https://developers.cloudflare.com/workers/runtime-apis/kv)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [cfw](https://github.com/lukeed/cfw) _monorepo workers management_

### Caveats

1. Still early days, there is no account or domain management, this is still manual.
1. Metrics around path is not accurate (maybe my postgress skills not so shavey).
1. Doesnt make use of the `CF-Country` from an overview perspective
1. Charting doesnt give sense of scale
1. No score "number out of a hundred" — if you know how to take a web-vital metric and turn it into a score, let me
   know!?

_Design inspiration: https://dribbble.com/shots/14281783-fintech-dashboard-user-interface_
