#!/usr/bin/env bash
# exit on error
set -o errexit

cd src/front
npm install
npm run build
cd ../..

pipenv install

pipenv run upgrade