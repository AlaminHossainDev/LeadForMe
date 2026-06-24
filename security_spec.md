# LeadForMe Security Rules Specification

This document defines the data invariants, test payloads, and verification specifications for the LeadForMe application's Firestore database rules.

## 1. Data Invariants

1. **Lead Ownership**: A business lead (Lead) cannot exist without a valid `userId` that strictly matches the authenticated user ID (`request.auth.uid`).
2. **Audit Isolation**: A website audit is linked to a lead. Access to an audit is derived from checking the parent Lead document's `userId`. Users can only access or create audits if they own the corresponding Lead.
3. **Outreach Isolation**: Outreach sequences are linked to a lead. Access is derived from checking the parent Lead's `userId`.
4. **Settings Restriction**: User settings are keyed by the user's ID (`userId` matches the document name and `request.auth.uid`). Users can only read or write their own settings.
5. **No Cross-Tenant Read/Write**: Users can never query, read, update, or delete records belonging to another user.

---

## 2. The "Dirty Dozen" Payloads (Identity, Integrity, and State Violations)

These payloads represent malicious attempts to compromise the database. Security rules must block all of these:

1. **Privilege Escalation on Create (Lead)**: User `user_abc` attempts to create a lead with `userId: 'user_xyz'` (maliciously impersonating or creating data for another user).
2. **Unauthorized Lead Read (Single Lead)**: User `user_abc` attempts to read `/leads/lead_owned_by_xyz`.
3. **Bulk Data Extraction (Query Scraping)**: User `user_abc` attempts to list leads without matching `userId == 'user_abc'` in the query filter.
4. **Unauthorized Lead Update**: User `user_abc` attempts to change values of `/leads/lead_owned_by_xyz`.
5. **Immutability Violation (Lead CreatedAt)**: User attempts to modify `createdAt` or `userId` of an existing lead.
6. **State Skip (CRM Stage Bypass)**: Attempting to update a lead's stage to a state that is not in the CRM stage enum.
7. **Orphaned Audit Creation**: Attempting to create a Website Audit (`/audits/audit_1`) with a non-existent `leadId` or a `leadId` belonging to another user.
8. **Malicious Audit Scraping**: User `user_abc` attempts to read `/audits/audit_owned_by_xyz`.
9. **Settings Hijacking**: User `user_abc` attempts to write settings for document ID `user_xyz`.
10. **Resource Poisoning (Junk Lead ID)**: Attempting to create a lead with a 2MB lead ID or character-filled ID to deplete resources.
11. **Spoofed Audit Scores**: Attempting to save a negative website score (e.g., `-100`) or score exceeding `100` in a WebsiteAudit.
12. **Unauthenticated Access**: Completely unauthenticated user attempting to query lists or create a lead.

---

## 3. Firestore Rules Structure

We will implement the complete ruleset in `/firestore.rules` based on these specifications.
