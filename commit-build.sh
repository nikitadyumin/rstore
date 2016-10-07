#!/bin/bash
set -ev
git status
git add ./dist/rstore.js
git commit -m "add bundle"
git push