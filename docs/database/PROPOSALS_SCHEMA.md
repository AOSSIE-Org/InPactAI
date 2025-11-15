# Proposals Table Schema

## Overview

The `proposals` table stores collaboration proposals sent by brands to creators for specific campaigns. This enables brands to proactively reach out to creators they've identified as good matches for their campaigns.

## Table Structure

### `proposals`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique proposal identifier |
| `campaign_id` | uuid | NOT NULL, FOREIGN KEY → campaigns(id) | Reference to the campaign |
| `brand_id` | uuid | NOT NULL, FOREIGN KEY → brands(id) | Reference to the brand sending the proposal |
| `creator_id` | uuid | NOT NULL, FOREIGN KEY → creators(id) | Reference to the creator receiving the proposal |
| `subject` | text | NOT NULL | Subject line of the proposal |
| `message` | text | NOT NULL | Full proposal message content |
| `proposed_amount` | numeric | NULL | Proposed compensation amount in INR |
| `content_ideas` | text[] | DEFAULT [] | Array of content ideas suggested |
| `ideal_pricing` | text | NULL | Text description of ideal pricing |
| `status` | text | NOT NULL, DEFAULT 'pending', CHECK | Status: 'pending', 'accepted', 'declined', 'withdrawn' |
| `created_at` | timestamp with time zone | DEFAULT now() | When the proposal was created |
| `updated_at` | timestamp with time zone | DEFAULT now() | When the proposal was last updated |

### Constraints

- **Primary Key**: `id`
- **Foreign Keys**:
  - `campaign_id` → `campaigns(id)` ON DELETE CASCADE
  - `brand_id` → `brands(id)` ON DELETE CASCADE
  - `creator_id` → `creators(id)` ON DELETE CASCADE
- **Unique Constraint**: `(campaign_id, creator_id, brand_id)` - Prevents duplicate proposals for the same campaign-creator-brand combination
- **Check Constraint**: `status` must be one of: 'pending', 'accepted', 'declined', 'withdrawn'

### Indexes

- `idx_proposals_campaign_id` on `campaign_id`
- `idx_proposals_brand_id` on `brand_id`
- `idx_proposals_creator_id` on `creator_id`
- `idx_proposals_status` on `status`
- `idx_proposals_created_at` on `created_at DESC`

### Triggers

- `update_proposals_updated_at`: Automatically updates `updated_at` timestamp on row update

## Status Flow

1. **pending**: Initial status when proposal is created
2. **accepted**: Creator accepts the proposal
3. **declined**: Creator declines the proposal
4. **withdrawn**: Brand withdraws the proposal

## Usage Examples

### Create a Proposal

```sql
INSERT INTO proposals (campaign_id, brand_id, creator_id, subject, message, proposed_amount)
VALUES (
  'campaign-uuid',
  'brand-uuid',
  'creator-uuid',
  'Collaboration Opportunity',
  'We would love to work with you...',
  50000
);
```

### Get Proposals Sent by a Brand

```sql
SELECT p.*, c.title as campaign_title, cr.display_name as creator_name
FROM proposals p
JOIN campaigns c ON p.campaign_id = c.id
JOIN creators cr ON p.creator_id = cr.id
WHERE p.brand_id = 'brand-uuid'
ORDER BY p.created_at DESC;
```

### Get Proposals Received by a Creator

```sql
SELECT p.*, c.title as campaign_title, b.company_name as brand_name
FROM proposals p
JOIN campaigns c ON p.campaign_id = c.id
JOIN brands b ON p.brand_id = b.id
WHERE p.creator_id = 'creator-uuid'
ORDER BY p.created_at DESC;
```

### Update Proposal Status

```sql
UPDATE proposals
SET status = 'accepted', updated_at = now()
WHERE id = 'proposal-uuid';
```

## Related Tables

- **campaigns**: The campaign this proposal is for
- **brands**: The brand sending the proposal
- **creators**: The creator receiving the proposal

## API Endpoints

The proposals functionality is exposed through the following API endpoints:

- `POST /proposals` - Create a new proposal
- `GET /proposals/sent` - Get proposals sent by the current brand
- `GET /proposals/received` - Get proposals received by the current creator
- `PUT /proposals/{proposal_id}/status` - Update proposal status
- `POST /proposals/draft` - AI-draft proposal content

## Notes

- The unique constraint on `(campaign_id, creator_id, brand_id)` ensures a brand can only send one proposal per creator per campaign
- Proposals are automatically deleted when the associated campaign, brand, or creator is deleted (CASCADE)
- The `updated_at` field is automatically maintained by a trigger

