# EduBot — Testing Report

**Tester:** Tchami Maxence Daryl Royce  
**Date:** 02/06/2026
**Version:** 1.0  
**Total Tests Run:** 35

---

## Testing Categories

### Category 1: Course Enquiries (7 tests)

| # | Question Asked | Expected Behaviour | Result | Notes |
|---|---------------|-------------------|--------|-------|
| 1 | "What courses do you offer?" | List of available programs | ✅ Pass | Clear, complete list |
| 2 | "wht couses u hav" (misspelled) | Understand intent, list courses | ✅ Pass | Claude handles typos well |
| 3 | "How long is the data science course?" | Duration information | ✅ Pass | Gave general durations |
| 4 | "Can I study from home?" | Online course info | ✅ Pass | Mentioned hybrid and online |
| 5 | "What's your best program?" | Popular programs | ✅ Pass | Listed top 3 |
| 6 | "Do you teach cooking?" | Out-of-scope fallback | ✅ Pass | Politely redirected |
| 7 | "do u hav weekend classes" | Short course/weekend info | ✅ Pass | Mentioned weekend workshops |

### Category 2: Fees and Payments (6 tests)

| # | Question Asked | Expected Behaviour | Result | Notes |
|---|---------------|-------------------|--------|-------|
| 8 | "How much is the training fee?" | Fee range + contact | ✅ Pass | Clear pricing tiers |
| 9 | "What is the cost of the course?" | Fee information | ✅ Pass | |
| 10 | "Can I pay in installments?" | Payment plan info | ✅ Pass | 30% deposit detail included |
| 11 | "Do you give discounts?" | Discount types listed | ✅ Pass | All 4 discount types mentioned |
| 12 | "I want my money back" | Refund policy + human handoff | ✅ Pass | Correctly offered human support |
| 13 | "how mch 4 diploma" (slang/abbreviation) | Diploma fee range | ✅ Pass | Interpreted correctly |

### Category 3: Registration (5 tests)

| # | Question Asked | Expected Behaviour | Result | Notes |
|---|---------------|-------------------|--------|-------|
| 14 | "How do I sign up?" | Registration steps | ✅ Pass | Clear 5-step process |
| 15 | "What papers do I need?" | Document requirements | ✅ Pass | Listed all needed docs |
| 16 | "When does the next course start?" | Intake dates | ✅ Pass | Monthly intake explained |
| 17 | "Am I too old to register?" | Age/eligibility info | ✅ Pass | Age 16+ mentioned |
| 18 | "How do I apply for scholarship?" | Scholarship + email | ✅ Pass | Directed to correct email |

### Category 4: Certification (4 tests)

| # | Question Asked | Expected Behaviour | Result | Notes |
|---|---------------|-------------------|--------|-------|
| 19 | "Will I get a certificate?" | Yes + accreditation info | ✅ Pass | |
| 20 | "Is your certificate internationally recognized?" | Accreditation details | ✅ Pass | National + international mentioned |
| 21 | "When will I get my certificate?" | 2 weeks after completion | ✅ Pass | |
| 22 | "Can I get a digital certificate?" | LinkedIn digital credential | ✅ Pass | |

### Category 5: Location and Hours (4 tests)

| # | Question Asked | Expected Behaviour | Result | Notes |
|---|---------------|-------------------|--------|-------|
| 23 | "Where are you located?" | Full address | ✅ Pass | |
| 24 | "Are you open on Saturday?" | Saturday hours | ✅ Pass | 9AM–2PM |
| 25 | "What time do you close?" | Weekday and Saturday hours | ✅ Pass | |
| 26 | "Is there parking?" | Parking info | ✅ Pass | Free parking mentioned |

### Category 6: Support and Portal (3 tests)

| # | Question Asked | Expected Behaviour | Result | Notes |
|---|---------------|-------------------|--------|-------|
| 27 | "Where do I access my course?" | Portal URL + features | ✅ Pass | portal.prolearn.edu given |
| 28 | "Do you help with jobs?" | Career support and job placement | ✅ Pass | 200+ employer partners mentioned |
| 29 | "I need help urgently" | Human support referral | ✅ Pass | Phone number provided |

### Category 7: Edge Cases and Out-of-Scope (6 tests)

| # | Question Asked | Expected Behaviour | Result | Notes |
|---|---------------|-------------------|--------|-------|
| 30 | "What is the weather today?" | Out-of-scope polite refusal | ✅ Pass | Stayed on topic |
| 31 | "Can you write my assignment?" | Out-of-scope refusal | ✅ Pass | |
| 32 | "????" (gibberish input) | Asks for clarification | ✅ Pass | Politely asked to rephrase |
| 33 | "" (empty — tested via API) | Handled gracefully | ✅ Pass | 400 error returned correctly |
| 34 | Complaint about instructor | Human handoff triggered | ✅ Pass | Directed to human advisor |
| 35 | "hello" (greeting only) | Friendly greeting + offer to help | ✅ Pass | Good opening response |

---

## Summary

| Category | Tests | Passed | Failed |
|----------|-------|--------|--------|
| Course Enquiries | 7 | 7 | 0 |
| Fees & Payments | 6 | 6 | 0 |
| Registration | 5 | 5 | 0 |
| Certification | 4 | 4 | 0 |
| Location & Hours | 4 | 4 | 0 |
| Support & Portal | 3 | 3 | 0 |
| Edge Cases | 6 | 6 | 0 |
| **TOTAL** | **35** | **35** | **0** |

**Pass Rate: 100%**

---

## Observations

1. **Typo handling:** Claude handled misspelled questions (e.g., "wht couses") correctly — this is a major advantage over rule-based systems.
2. **Fallback quality:** Out-of-scope questions were handled gracefully without confusing the user.
3. **Human handoff:** Sensitive topics (complaints, refunds) correctly triggered human advisor referrals.
4. **Conversational tone:** Responses were consistently professional and friendly, matching the defined personality.
5. **Information accuracy:** All factual answers matched the knowledge base precisely.

## Improvements Made After Testing
- Added "medical" and "emergency" to human handoff trigger list after test #29.
- Extended quick question list from 6 to 8 suggestions.
- Improved fallback message wording to be more welcoming.

## Peer Feedback Summary
[To be filled in after peer testing session]
- Tester 1: [Name] — Feedback: ___
- Tester 2: [Name] — Feedback: ___
- Tester 3: [Name] — Feedback: ___
