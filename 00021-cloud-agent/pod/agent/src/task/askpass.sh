#!/bin/sh
case "$1" in
  *Username*) printf 'x-access-token\n' ;;
  *Password*) printf '%s\n' "$GITHUB_TOKEN" ;;
  *) exit 1 ;;
esac
