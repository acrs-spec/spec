// ---------------------------------------------------------------------------
// ACRS — Agent Commerce Registry Standard
// Schema v1.0 (Draft)
//
// This file is the source of truth. JSON Schema is generated from it.
// Do not hand-edit schema/draft/schema.json — run `pnpm run generate:schema`.
// ---------------------------------------------------------------------------

// ---- String union types (become JSON Schema enums) ------------------------

/** Pricing model for task execution. */
export type PricingModel =
  | 'per_task'
  | 'per_token'
  | 'per_minute'
  | 'per_output_unit'
  | 'subscription'
  | 'outcome_based'
  | 'free'
  | 'negotiated';

/** Refund policy declared by the publisher. */
export type RefundPolicy =
  | 'none'
  | 'full_on_failure'
  | 'partial_on_failure'
  | 'pro_rata'
  | 'at_publisher_discretion';

/** Accepted payment method identifiers. */
export type PaymentMethod =
  | 'stripe_connect'
  | 'stripe_spt'
  | 'wire'
  | 'crypto_usdc'
  | 'invoice'
  | 'platform_wallet';

/** Compliance certification identifiers. */
export type Certification =
  | 'soc2_type1'
  | 'soc2_type2'
  | 'iso_27001'
  | 'hipaa'
  | 'pci_dss'
  | 'gdpr_dpa'
  | 'other';

/** Primary capability category for routing and discovery. */
export type PrimaryCategory =
  | 'research'
  | 'writing'
  | 'data'
  | 'code'
  | 'scheduling'
  | 'finance'
  | 'legal'
  | 'hr'
  | 'communication'
  | 'media'
  | 'operations'
  | 'customer_service'
  | 'orchestrator'
  | 'other';

// ---- Sub-object interfaces ------------------------------------------------

/** Free-tier allowance for task execution. */
export interface AcrsFreeTier {
  /** Number of free units allowed. */
  quantity: number;
  /** Unit type (e.g. "tasks", "tokens", "minutes"). */
  unit: string;
  /** Reset period (e.g. "monthly", "weekly"). */
  period?: string;
}

/** Commercial pricing declaration. */
export interface AcrsPricing {
  /** Pricing model for task execution. */
  model?: PricingModel;
  /**
   * Base price in declared currency. For per_token: price per 1,000 tokens.
   * @minimum 0
   */
  amount?: number;
  /**
   * ISO 4217 currency code.
   * @default "USD"
   * @pattern ^[A-Z]{3}$
   */
  currency?: string;
  /**
   * Minimum charge per invocation.
   * @minimum 0
   */
  minimum?: number;
  /**
   * Maximum charge per invocation (cap).
   * @minimum 0
   */
  maximum?: number;
  /** Free-tier allowance. */
  free_tier?: AcrsFreeTier;
  /** Contact for volume pricing negotiation. */
  enterprise_contact?: string;
}

/** Service Level Agreement declarations. All fields are publisher-declared. */
export interface AcrsSla {
  /**
   * Maximum task completion time in seconds.
   * @minimum 1
   * @asType integer
   */
  max_duration_seconds?: number;
  /**
   * 99th percentile task duration in seconds (publisher-declared).
   * @minimum 1
   * @asType integer
   */
  p99_duration_seconds?: number;
  /**
   * Uptime guarantee as a decimal fraction. 0.999 = 99.9%.
   * @minimum 0
   * @maximum 1
   */
  uptime_guarantee?: number;
  /** Refund policy declared by the publisher. */
  refund_policy?: RefundPolicy;
  /**
   * Maximum hours to first support response.
   * @minimum 0
   */
  support_response_hours?: number;
  /**
   * Days task data is retained. 0 = no retention.
   * @minimum 0
   * @asType integer
   */
  data_retention_days?: number;
}

/** Payment and dispute infrastructure. */
export interface AcrsCommerce {
  /**
   * HTTPS URI for payment initiation requests.
   * @format uri
   */
  payment_endpoint?: string;
  /** mailto: or HTTPS URI for dispute submission. */
  dispute_contact?: string;
  /** Publisher supports escrow-held payment. */
  escrow_supported?: boolean;
  /**
   * Verification endpoint. Required when pricing.model = outcome_based.
   * @format uri
   */
  outcome_verification_url?: string;
  /** Contact for enterprise invoicing. */
  invoice_contact?: string;
  /** Accepted payment method identifiers. */
  accepted_payment_methods?: PaymentMethod[];
}

/** Regulatory and data handling declarations. All fields are publisher-declared. */
export interface AcrsCompliance {
  /**
   * ISO 3166-1 alpha-2 country codes where task data is processed.
   */
  data_residency?: string[];
  /** Compliance certifications held by the publisher. */
  certifications?: Certification[];
  /** Use cases the publisher explicitly does not support. */
  prohibited_use_cases?: string[];
  /** Publisher will provide task audit log on request. */
  audit_log_available?: boolean;
  /**
   * HTTPS URI receiving task audit events.
   * @format uri
   */
  audit_webhook?: string;
}

/** Taxonomy classification for routing and discovery. */
export interface AcrsCategories {
  /** Primary capability category. */
  primary?: PrimaryCategory;
  /** Additional capability categories. */
  secondary?: string[];
  /**
   * Free-text tags. Lowercase, hyphen-separated.
   */
  tags?: string[];
}

// ---- Root interface -------------------------------------------------------

/**
 * ACRS Extension Params.
 *
 * Declared inside `capabilities.extensions` in an A2A Agent Card
 * with `uri: "https://acrs-spec.org/extensions/v1"`.
 *
 * @title ACRS Extension Params
 * @additionalProperties false
 */
export interface AcrsExtensionParams {
  /**
   * ACRS specification version. MUST be "1.0" for this revision.
   * @pattern ^\d+\.\d+$
   */
  version: string;
  /** Commercial pricing declaration. */
  pricing?: AcrsPricing;
  /** Service level commitments. */
  sla?: AcrsSla;
  /** Payment and dispute infrastructure. */
  commerce?: AcrsCommerce;
  /** Regulatory and data handling declarations. */
  compliance?: AcrsCompliance;
  /** Taxonomy classification for routing and discovery. */
  categories?: AcrsCategories;
}
