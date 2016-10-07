#!/bin/bash
set -ev
git config --global user.email "dyuminnikita@gmail.com"
git config --global user.name "Travis CI"
git status
git add ./dist/rstore.js
git commit -m "add bundle"
git push