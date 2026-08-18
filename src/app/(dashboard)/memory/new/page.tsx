import { PageHeader, SecondaryLink } from "@/components/dashboard-ui";

export default function NewMemoryPage() {
  return (
    <div className="page-stack page-stack--narrow">
      <PageHeader
        description="Preserve a confirmed failure mode and the regression evidence that should protect future changes."
        eyebrow="QA memory / New record"
        title="Record QA memory"
      />
      <form className="form-card panel">
        <label>
          <span>Title</span>
          <input placeholder="Cross-account invoice access" />
        </label>
        <label>
          <span>What happened</span>
          <textarea rows={4} placeholder="Describe the confirmed behavior and its impact." />
        </label>
        <label>
          <span>Root cause</span>
          <textarea rows={3} placeholder="What implementation condition allowed the failure?" />
        </label>
        <div className="form-row">
          <label>
            <span>Severity</span>
            <select defaultValue="Critical">
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
          <label>
            <span>Related contract</span>
            <input placeholder="invoice-access" />
          </label>
        </div>
        <label>
          <span>Tags</span>
          <input placeholder="authorization, idor, invoice" />
        </label>
        <div className="form-actions">
          <SecondaryLink href="/memory">Cancel</SecondaryLink>
          <button className="button button--primary" type="button">
            Record memory
          </button>
        </div>
      </form>
    </div>
  );
}
