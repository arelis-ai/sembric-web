import { ButtonLink, CheckList, CodeBlock, CtaBand, FaqList, PageHero, PageNav, Section } from '../components/ui';
import { AGENTS_FAQ } from '../content/faqs';
import { MCP_TOOLS } from '../site';

const MESSAGES_API = `{
  "mcp_servers": [{
    "type": "url",
    "url": "https://your-sembric.example.com/mcp",
    "name": "sembric",
    "authorization_token": "YOUR_SEMBRIC_AGENT_KEY"
  }],
  "tools": [{
    "type": "mcp_toolset",
    "mcp_server_name": "sembric"
  }]
}`;

const TOOLS_LIST = `curl -fsS "$SEMBRIC_URL/mcp" \\
  -H "Authorization: Bearer $SEMBRIC_AGENT_KEY" \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json, text/event-stream' \\
  -d '{"jsonrpc":"2.0","id":1,
       "method":"tools/list","params":{}}'`;

const QUERY = `{
  "productId": "…",
  "dimensions": ["ordered_at:quarter", "region"],
  "filters": {
    "region": { "in": ["North", "East"] },
    "ordered_at": {
      "gte": "2026-01-01T00:00:00",
      "lt": "2027-01-01T00:00:00"
    }
  },
  "limit": 20
}`;

export function Agents() {
  return (
    <>
      <PageHero
        eyebrow="Agents and MCP"
        title="Connect any MCP agent to answers your team has certified"
        lede="Sembric runs a stateless HTTP MCP server and a typed REST API. Every call is limited to the certified products, governed views and ontology entries granted to the caller’s current role."
        actions={
          <>
            <ButtonLink href="#connect" arrow>
              Connect an agent
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Request a pilot
            </ButtonLink>
          </>
        }
      />
      <PageNav
        items={[
          { id: 'tools', label: 'Tools' },
          { id: 'credentials', label: 'Credentials' },
          { id: 'connect', label: 'Connect' },
          { id: 'query', label: 'Queries' },
          { id: 'monitor', label: 'Monitoring' },
          { id: 'faq', label: 'FAQ' },
        ]}
      />

      <Section
        id="tools"
        eyebrow="Tools"
        title="Eight read-only tools"
        intro="Agents discover what they may use, read its definition, then query it. There is no tool that accepts SQL."
      >
        <div className="table-wrap reveal">
          <table className="spec-table">
            <caption className="sr-only">Sembric MCP tools</caption>
            <thead>
              <tr>
                <th scope="col">Tool</th>
                <th scope="col">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {MCP_TOOLS.map(([tool, purpose]) => (
                <tr key={tool}>
                  <th scope="row">
                    <code>{tool}</code>
                  </th>
                  <td>{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="credentials" tone="sunken" eyebrow="Credentials" title="Two ways for an agent to authenticate">
        <div className="card-grid card-grid-2">
          <article className="card reveal">
            <p className="card-kicker">Direct clients</p>
            <h3>Sembric API keys</h3>
            <CheckList
              items={[
                'Created on the Agents page for a member with the intended role; one-, seven- or 30-day lifetimes, one day by default.',
                'Shown once, stored as a digest, revocable immediately.',
                'Inherit the member’s current role, so a role change applies to their agents on the next call.',
              ]}
            />
          </article>
          <article className="card reveal">
            <p className="card-kicker">User-linked</p>
            <h3>OIDC access tokens</h3>
            <CheckList
              items={[
                'Signed JWTs from your configured issuer, with audience equal to Sembric’s /mcp resource and the sembric:read scope.',
                'Must carry a verified email that matches exactly one current workspace member.',
                'Sembric publishes protected-resource metadata so OAuth-aware clients can discover the requirement.',
              ]}
            />
          </article>
        </div>
      </Section>

      <Section
        id="connect"
        eyebrow="Connect"
        title="Verify the endpoint, then add it to your agent"
        intro="Use a short-lived key and a public HTTPS Sembric endpoint. The tool list returns only what the key’s member may see."
      >
        <div className="code-grid">
          <CodeBlock id="code-tools-list" label="List tools with curl" code={TOOLS_LIST} />
          <CodeBlock id="code-messages-api" label="Claude Messages API MCP connector" code={MESSAGES_API} />
        </div>
        <p className="fine-print">
          Claude Code and other HTTP MCP clients connect to the same <code>/mcp</code> endpoint with the key as a bearer
          token. ChatGPT’s custom MCP connection requires the user-linked OAuth path.
        </p>
      </Section>

      <Section
        id="query"
        tone="sunken"
        eyebrow="Asking richer questions"
        title="Grouping, time grains and typed filters"
        intro={
          <>
            <code>sembric_query_product</code> groups by up to three declared dimensions. Date and timestamp dimensions
            accept day, week, month, quarter or year grains; send integers and decimals as strings and dates as{' '}
            <code>YYYY-MM-DD</code>.
          </>
        }
      >
        <div className="split">
          <CodeBlock id="code-query" label="Arguments for sembric_query_product" code={QUERY} />
          <div className="split-copy reveal">
            <h3>Two deliberate refusals</h3>
            <CheckList
              tone="no"
              items={[
                'A query matching more groups or rows than its limit is refused with narrowing guidance, never truncated.',
                'Groups backed by fewer records than a product’s minimum are omitted, so an empty result can mean the group is too small to release.',
              ]}
            />
          </div>
        </div>
      </Section>

      <Section
        id="monitor"
        layout="aside"
        eyebrow="Monitoring"
        title="See what your agents attempted"
        intro="Owners and engineers watch agent traffic over the last 24 hours, 7 days or 30 days."
      >
        <CheckList
          items={[
            'Answered and refused calls, compared with the previous period, plus the products and views agents query most.',
            'Recent refusals with the reason the agent received, and a live feed of the latest calls.',
            'Every key with its holder, role, expiry and last use over MCP or REST.',
            'Audit filters by channel, key, member and time.',
          ]}
        />
      </Section>

      <FaqList items={AGENTS_FAQ} />
      <CtaBand
        title="Give your agents their first certified surface"
        body="We’ll help you certify a product on your own warehouse and connect Claude Code or your own agent to it."
      />
    </>
  );
}
