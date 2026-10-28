<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { PROBLEMS, problemRows } from '#lib/kb/problems';

  let { ticket, repo }: { ticket: number; repo: string } = $props();

  const result = $derived(problemRows(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{result.unique}</strong> reports in #{ticket} ({result.exported} rows in the export, {result.exported - result.unique} of them
  the same report twice) · <strong>{result.rows.length}</strong> problems
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>intake agreed</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each result.rows as row (row.problem)}
      {@const p = row.problem === 'unplaced' ? null : PROBLEMS[row.problem]}
      <tr>
        <td><code>{row.problem}</code>{#if p}<br /><span class="what">{p.title}</span>{/if}</td>
        <td>{row.reports}</td>
        <td>{row.tenants}</td>
        <td>{row.firstSeen} → {row.lastSeen}</td>
        <td>{row.intakeAgrees} of {row.reports}</td>
        <td>{#if p}<a href="https://github.com/{repo}/issues/{p.issue}">{repo}#{p.issue}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .what { color: var(--muted); font-size: 0.85em; }
</style>
