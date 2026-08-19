import { PageHeader, SecondaryLink } from "@/components/dashboard-ui";
import { createMemoryAction } from "@/lib/product-actions";

export default function NewMemoryPage() {
  return (
    <div className="page-stack page-stack--narrow">
      <PageHeader
        description="Preserve a confirmed failure mode and the regression evidence that should protect future changes."
        eyebrow="QA memory / New record"
        title="Record QA memory"
      />
      <form action={createMemoryAction} className="form-card panel">
        <label>
          <span>Title</span>
          <input name="title" placeholder="Cross-account invoice access" required />
        </label>
        <label>
          <span>What happened</span>
          <textarea name="summary" rows={4} placeholder="Describe the confirmed behavior and its impact." required />
        </label>
        <label>
          <span>Root cause</span>
          <textarea name="rootCause" rows={3} placeholder="What implementation condition allowed the failure?" required />
        </label>
        <div className="form-row">
          <label>
            <span>Severity</span>
            <select defaultValue="critical" name="severity">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            <span>Related contract</span>
            <input name="relatedContract" placeholder="invoice-access" />
          </label>
        </div>
        <label>
          <span>Tags</span>
          <input name="tags" placeholder="authorization, idor, invoice" />
        </label>
        <div className="form-actions">
          <SecondaryLink href="/memory">Cancel</SecondaryLink>
          <button className="button button--primary" type="submit">
            Record memory
          </button>
        </div>
      </form>
    </div>
  );
}
