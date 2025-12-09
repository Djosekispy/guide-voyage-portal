#!/bin/bash
# Remove firebase-service-account.json from git history
git reset HEAD firebase-service-account.json
git rm --cached firebase-service-account.json
git commit --amend --no-edit
git push origin main
