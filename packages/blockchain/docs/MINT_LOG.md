# 📝 SEMILLA Token Mint Log

**Contract:** 0x8a3b2D350890e23D5679a899070B462DfFEe0643
**Network:** Polygon Amoy Testnet
**Chain ID:** 80002

---

## Current Supply Status

**Total Minted:** 100 SEMILLA
**Remaining Available:** 9,900 SEMILLA
**Max Supply:** 10,000 SEMILLA

---

## Mint History

### 2025-11-03 - Test Mint #1

**Recipient:** 0x25Dd6346FE82E51001a9430CF07e8DeB84933627
**Amount:** 50 SEMILLA
**Purpose:** Initial contract testing
**Approved by:** Deployer
**Transaction:** [0xadccf05ce3168ce21ea7a11a4a440760cb22c2e35db733f5e6a806dad0bd2549](https://amoy.polygonscan.com/tx/0xadccf05ce3168ce21ea7a11a4a440760cb22c2e35db733f5e6a806dad0bd2549)
**Block:** 28562206
**Status:** ✅ Confirmed
**Notes:** First mint to verify contract deployment

---

### 2025-11-03 - Josu Wallet

**Recipient:** 0xe88952fa33112ec58c83dae2974c0fef679b553d
**Amount:** 50 SEMILLA
**Purpose:** Testing MetaMask integration and user flow
**Approved by:** Deployer
**Transaction:** [0x7abcb8d3f9919a6ff45d19d38c49ebb879e7b6d4469b3ab7b49e9664bd8407fa](https://amoy.polygonscan.com/tx/0x7abcb8d3f9919a6ff45d19d38c49ebb879e7b6d4469b3ab7b49e9664bd8407fa)
**Block:** 28563776
**Status:** ✅ Confirmed
**User Confirmed:** ✅ Yes - "tengo 50 semillas"
**Notes:** Successfully imported to MetaMask. Full user flow validated.

---

## Template for New Entries

```markdown
### YYYY-MM-DD - Description

**Recipient:** 0x...
**Amount:** X SEMILLA
**Purpose:** Why this mint is needed
**Approved by:** Who approved
**Transaction:** [0x...](https://amoy.polygonscan.com/tx/0x...)
**Block:** XXXXXX
**Status:** ⏳ Pending / ✅ Confirmed / ❌ Failed
**User Confirmed:** ⏳ Waiting / ✅ Yes / ❌ No
**Notes:** Any additional context
```

---

## Guidelines for Minting

### Before Minting
1. ✅ Verify user identity
2. ✅ Check they have Polygon Amoy configured in MetaMask
3. ✅ Confirm they understand it's testnet (no real value)
4. ✅ Document reason for mint

### During Minting
1. ✅ Use scripts/mint-to-user.js
2. ✅ Verify transaction sent
3. ✅ Wait for confirmation
4. ✅ Update this log immediately

### After Minting
1. ✅ Provide user with import instructions
2. ✅ Verify user can see tokens in MetaMask
3. ✅ Mark as "User Confirmed" in log
4. ✅ Update Total Supply count

---

## Emergency Contacts

**If you detect unauthorized mints:**
1. Immediately run: `npx hardhat run scripts/emergency-pause.js --network amoy`
2. Document the incident
3. Investigate what happened
4. Contact deployer wallet owner

**Deployer Wallet:** 0xA26Ca887bc9C8648Baa02B282F69D7E3664F25bf
**Contract Pauser Role:** Deployer (same wallet)

---

## Mint Statistics

### By Purpose
- Testing: 100 SEMILLA (2 mints)
- Beta Users: 0 SEMILLA (0 mints)
- Community Rewards: 0 SEMILLA (0 mints)

### Success Rate
- Total Attempts: 2
- Successful: 2 (100%)
- Failed: 0 (0%)
- User Confirmed: 1 (50%)
- Pending Confirmation: 1 (50%)

---

## Next Beta Testers (Planning)

When ready for beta testing, add beta testers here:

```markdown
### Pending Mints
- [ ] Beta Tester 1 (0x...) - 25 SEMILLA - Role: Testing transfers
- [ ] Beta Tester 2 (0x...) - 25 SEMILLA - Role: Testing burns
- [ ] Beta Tester 3 (0x...) - 10 SEMILLA - Role: Testing small amounts
```

---

**Last Updated:** 2025-11-03
**Last Mint:** Block 28563776
**Total Supply:** 100 / 10,000 SEMILLA (1.0%)
