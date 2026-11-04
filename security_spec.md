# Security Specification: AegisShield VPN

## 1. Data Invariants
1. A user document `/users/{userId}` can only be read, created, or updated by the authenticated user whose `request.auth.uid == userId`.
2. A user's sessions `/users/{userId}/sessions/{sessionId}` must have `incoming().userId == request.auth.uid` and can only be accessed by that user.
3. A user's invoices `/users/{userId}/invoices/{invoiceId}` must belong to the authenticated user and cannot be deleted or forged by other users.
4. Unauthenticated users cannot read or write any user records or session history.
5. All document IDs must conform to alphanumeric formatting (`^[a-zA-Z0-9_-]+$`) and be bounded to 128 characters.
6. User identity spoofing (setting `userId` to a foreign UID) is strictly prohibited.

## 2. The "Dirty Dozen" Vulnerability Test Payloads
1. **Foreign User Write**: Writing to `/users/victim_user_123` with `auth.uid = attacker_456` -> REJECT (PERMISSION_DENIED).
2. **Missing Auth Write**: Writing to `/users/any_user` without active authentication -> REJECT.
3. **Session Spoofing**: Creating a session where `incoming().userId != request.auth.uid` -> REJECT.
4. **Cross-Tenant Session Listing**: Attempting to query `/users/other_user/sessions` -> REJECT.
5. **Path Poisoning**: Submitting a document ID with special directory traversal characters -> REJECT.
6. **Denial-of-Wallet Payload**: Submitting a 5MB payload in a single property -> REJECT.
7. **Foreign Invoice Manipulation**: Updating an invoice of another user -> REJECT.
8. **Unverified Blanket Read**: Querying collection group or parent users without matching UID -> REJECT.
9. **Ghost Role Injection**: Injecting an `admin: true` field into user profile without authorization -> REJECT.
10. **Invoice Amount Tampering**: Modifying invoice status without owning the invoice parent -> REJECT.
11. **Negative Bytes Hack**: Writing negative byte counts for data transfers -> REJECT.
12. **Malformed Timestamp Attack**: Overriding audit timestamps with arbitrary past dates -> REJECT.
