#!/bin/bash
set -ev
git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"
git status
git add ./dist/rstore.js
git commit -m "add bundle: ${SHA}"
git push