#!/usr/bin/env bash
# exit on error
set -o errexit

cd src/front
npm install
npm run build
cd ../..

pipenv install

pipenv run flask delete-all-tag-data

pipenv run flask delete-all-game-data

pipenv run flask insert-game-tag-data

pipenv run flask insert-game-data

pipenv run migrate

pipenv run upgrade
