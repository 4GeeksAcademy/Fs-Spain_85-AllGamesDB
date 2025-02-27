#!/usr/bin/env bash
# exit on error
set -o errexit

cd src/front
npm install
npm run build
cd ../..

pipenv install

pipenv run flask db stamp head

pipenv run migrate

pipenv run upgrade

pipenv run flask insert-game-tag-data

pipenv run flask insert-game-data