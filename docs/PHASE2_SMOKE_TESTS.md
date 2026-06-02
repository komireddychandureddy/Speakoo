# Phase 2 Smoke Tests

This runbook validates the new Phase 2 backend/web/mobile-facing APIs.

## Preconditions

- API running locally on port 3000.
- Database migrated with latest schema.
- Three valid JWTs available:
  - admin
  - tutor
  - learner
- At least one completed booking available for tutor and learner test pair.

## Quick Start

1. Open [docs/phase2-smoke-tests.http](docs/phase2-smoke-tests.http).
2. Fill token and UUID placeholders at top of file.
3. Execute requests top-to-bottom.
4. Confirm status codes are 2xx and response payloads are structurally valid.

## Postman Import

1. Import [docs/phase2-smoke-tests.postman_collection.json](docs/phase2-smoke-tests.postman_collection.json).
2. Import [docs/phase2-smoke-tests.postman_environment.json](docs/phase2-smoke-tests.postman_environment.json).
3. Select the imported environment and replace token/UUID placeholders.
4. Run the collection in order.

## Newman (CLI)

Run locally:

```bash
newman run docs/phase2-smoke-tests.postman_collection.json \
  --environment docs/phase2-smoke-tests.postman_environment.json \
  --reporters cli,junit \
  --reporter-junit-export newman-results.xml
```

## CI Automation

- Workflow file: [.github/workflows/phase2-smoke-newman.yml](.github/workflows/phase2-smoke-newman.yml)
- Trigger: manual (`workflow_dispatch`)
- Required repository secrets:
  - `PHASE2_BASE_URL`
  - `PHASE2_ADMIN_ACCESS_TOKEN`
  - `PHASE2_TUTOR_ACCESS_TOKEN`
  - `PHASE2_LEARNER_ACCESS_TOKEN`
  - `PHASE2_BOOKING_ID`
  - `PHASE2_LEARNER_ID`
  - `PHASE2_PATH_ID`
  - `PHASE2_HOMEWORK_ID`
  - `PHASE2_PLAN_ID`

## Expected Outcomes

- Learning path creation and step insertion succeeds for admin only.
- Learner can enroll and read their path payload.
- Tutor can create session notes and assign homework for valid learner/session ownership.
- Learner can submit own homework only.
- Tutor/admin can review homework.
- Progress and badges endpoints return stable schema used by web leaderboard UI.
- Recommendation endpoint returns ranked tutors for learner.
- Subscription lifecycle endpoints (plans, subscribe, me, cancel) respond correctly.

## Common Failure Checks

- 401/403: invalid token or role mismatch.
- 400 on DTO: check missing required fields and UUID/date formats.
- 404 on IDs: booking/path/homework IDs are stale or from different environment.
- 409/constraint issues: duplicate slug or duplicate path step order.

## Notes

- Keep payment smoke usage in test mode only.
- Use spread-based optional payload patterns from frontend clients to avoid undefined-field validation failures.
