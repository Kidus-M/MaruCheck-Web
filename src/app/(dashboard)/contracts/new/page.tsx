import { PageHeader, SecondaryLink } from "@/components/dashboard-ui";

export default function NewContractPage() {
  return (
    <div className="page-stack page-stack--narrow">
      <PageHeader
        description="Draft product intent here, then review and approve it through the accountable contract workflow."
        eyebrow="Contracts / New draft"
        title="Create a Quality Contract"
      />
      <form className="form-card panel">
        <label>
          <span>Contract title</span>
          <input name="title" placeholder="Invoice access" />
        </label>
        <label>
          <span>Intent</span>
          <textarea
            name="intent"
            rows={5}
            placeholder="What must remain true, even as implementation changes?"
          />
        </label>
        <div className="form-row">
          <label>
            <span>Owner</span>
            <select name="owner" defaultValue="Platform">
              <option>Platform</option>
              <option>Billing</option>
              <option>Identity</option>
              <option>Web</option>
            </select>
          </label>
          <label>
            <span>Criticality</span>
            <select name="criticality" defaultValue="High">
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <SecondaryLink href="/contracts">Cancel</SecondaryLink>
          <button className="button button--primary" type="button">
            Save draft
          </button>
        </div>
      </form>
    </div>
  );
}
