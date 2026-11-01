// Synthetic sample data for tests and demos. Contains NO real client information.
import type { SeedClient } from "./seed";
export const SAMPLE_CLIENTS: SeedClient[] = [
  {
    "id": "pahadi-origin",
    "name": "Pahadi Origin",
    "kind": "client",
    "doNotSay": [
      "guaranteed results",
      "cures",
      "100% pure",
      "clinically proven"
    ],
    "facts": [
      {
        "kb": "business",
        "key": "name",
        "value": "[sample] name",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "offer_products",
        "value": "[sample] Product A ₹899, Product B ₹449",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "location",
        "value": "[sample] location",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "channels",
        "value": "[sample] channels",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "order_policy",
        "value": "[sample] order_policy",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "social_proof_on_store",
        "value": "[sample] social_proof_on_store",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "scarcity_claims",
        "value": "[sample] scarcity_claims",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "discount_claims",
        "value": "[sample] discount_claims",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "compliance_inferred",
        "value": "[sample] compliance_inferred",
        "status": "INFERRED",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "voice",
        "value": "[sample] voice",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "positioning",
        "value": "[sample] positioning",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "design_system_reference",
        "value": "[sample] design_system_reference",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "audience",
        "key": "geography",
        "value": "[sample] geography",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "assets",
        "key": "approved_assets",
        "value": "[sample] approved_assets",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "requirements",
        "key": "goals",
        "value": "[sample] goals",
        "status": "INFERRED",
        "source": "fixture:sample"
      },
      {
        "kb": "requirements",
        "key": "approval_policy",
        "value": "No post, ad launch, spend or client message without explicit approval.",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      }
    ]
  },
  {
    "id": "propedia",
    "name": "Propedia",
    "kind": "client",
    "doNotSay": [
      "100% legal",
      "verified property",
      "guaranteed returns",
      "guaranteed appreciation",
      "best deal in J&K",
      "golden opportunity"
    ],
    "facts": [
      {
        "kb": "business",
        "key": "name",
        "value": "[sample] name",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "offer_products",
        "value": "[sample] Product A ₹899, Product B ₹449",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "location",
        "value": "[sample] location",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "launch_priority",
        "value": "[sample] launch_priority",
        "status": "INFERRED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "jkrera_status",
        "value": "[sample] jkrera_status",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "digital_presence_status",
        "value": "[sample] digital_presence_status",
        "status": "INFERRED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "market",
        "value": "[sample] market",
        "status": "RESEARCHED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "stamp_duty",
        "value": "[sample] stamp_duty",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "price_benchmark",
        "value": "[sample] price_benchmark",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "positioning",
        "value": "[sample] positioning",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "voice",
        "value": "[sample] voice",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "do_not_say",
        "value": "[sample] banned phrases list",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "colors@design-system-readme",
        "value": "[sample] palette design-system-readme",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "colors@diagnostic-doc",
        "value": "[sample] palette diagnostic-doc",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "typography",
        "value": "[sample] typography",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "logo_files",
        "value": "[sample] logo_files",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "audience",
        "key": "personas",
        "value": "[sample] personas",
        "status": "ASSUMPTION",
        "source": "fixture:sample"
      },
      {
        "kb": "competitor",
        "key": "competitors",
        "value": "[sample] competitors",
        "status": "RESEARCHED",
        "source": "fixture:sample"
      },
      {
        "kb": "strategy",
        "key": "current_strategy",
        "value": "[sample] current_strategy",
        "status": "INFERRED",
        "source": "fixture:sample"
      },
      {
        "kb": "requirements",
        "key": "open_gaps",
        "value": "[sample] open_gaps",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "requirements",
        "key": "approval_policy",
        "value": "No post, ad launch, spend or client message without explicit approval.",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      }
    ]
  },
  {
    "id": "karan-personal-brand",
    "name": "Karan Targotra (Personal Brand)",
    "kind": "personal_brand",
    "doNotSay": [
      "guaranteed results",
      "get rich",
      "overnight"
    ],
    "facts": [
      {
        "kb": "business",
        "key": "name",
        "value": "[sample] name",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "offer_products",
        "value": "[sample] Product A ₹899, Product B ₹449",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "location",
        "value": "[sample] location",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "business",
        "key": "instagram_handle",
        "value": "[sample] instagram_handle",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "voice",
        "value": "[sample] voice",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "brand",
        "key": "design_system_reference",
        "value": "[sample] design_system_reference",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "content",
        "key": "previous_content",
        "value": "[sample] previous_content",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "content",
        "key": "weekly_system",
        "value": "[sample] weekly_system",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "performance",
        "key": "ga_note",
        "value": "[sample] ga_note",
        "status": "NEEDS VERIFICATION",
        "source": "fixture:sample"
      },
      {
        "kb": "requirements",
        "key": "approval_policy",
        "value": "No post, ad launch, spend or client message without explicit approval.",
        "status": "CLIENT-PROVIDED",
        "source": "fixture:sample"
      },
      {
        "kb": "requirements",
        "key": "client_requirements",
        "value": "[sample] client_requirements",
        "status": "ASSUMPTION",
        "source": "fixture:sample"
      }
    ]
  }
] as SeedClient[];
