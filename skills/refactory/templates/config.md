# Refactory config

## Rocket

<!-- The win condition. Concrete and checkable. Example: "invoices, payments and the API reach assembler tier, and
month-end runs in under 10 minutes." -->

## Scope

<!-- Areas in scope, and areas to leave alone. -->

## Mode

normal

<!-- `normal`: one owner, ships any day. `enterprise`: shared codebase with a release process; trend up, never
sledgehammer (see references/trend-up.md in the skill). -->

## Change process

<!-- Enterprise mode. How a change reaches production, so every upgrade fits it. Example:
- release: weekly train, cut on Tuesday; freeze in the last week of each quarter
- review: CODEOWNERS approve; payments needs two approvals
- size: at most ~300 changed lines per PR, excluding generated files
- risk: behaviour changes ship behind flags; no change ships without a business reason except tests and checks -->

## Upcoming work

<!-- Enterprise mode. Business work planned per area in the next few months. These are the vehicles for ride-alongs. Example:
- invoices: e-invoicing (Q1)
- reports: new tax report (Feb) -->

## Budget per autonomous pass

30 minutes or 40 files read, then stop and report.

## Checks

<!-- The exact commands. Example:
- tests: `npm test -- --maxWorkers=2`
- types: `npm run typecheck`
- lint: `npm run lint`
Note any wrapper the project requires for heavy commands. -->

## Hotspots

<!-- Extra paths to skip, as an extended regex for REFACTORY_EXCLUDE. Example: `(^|/)generated/|\.pb\.go$` -->

## Needs the user

<!-- Changes that always need a go-ahead here, beyond the skill's defaults. -->

## Local rules

<!-- Rules learned in this codebase. The reflect playbook adds to this list. -->
