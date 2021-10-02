#/usr/bin/env bash

SECRET_DIR="./secrets"

set -euo pipefail

umask 0077

prompt() # question dst [opt]
{
  local question="$1"
  local dst="$2"

  local opt="${3:-}"

  printf '%s' "$question: "
  IFS="" read -r $opt "$dst"
}

config_secret() # name [opt]
{
  local name="$1"

  local opt="${2:-}"

  prompt "${name//_/ }" "$name" "$opt"

  [ -f "$SECRET_DIR/$name" ] && rm "$SECRET_DIR/$name"

  printf "%s" "${!name}" > "$SECRET_DIR/$name"

  unset "$name"
}

config_env() # name file [opt]
{
  local name="$1"
  local file="$2"

  local opt="${3:-}"

  prompt "$(tr '[:upper:]_' '[:lower:] ')" "$name" "$opt"
  echo "$name=${!name}" > "$file"
}

config_mongo()
{
  config_secret mongo_root_username
  config_secret mongo_root_password -s; echo
}

config_oauth()
{
  config_env oauth_uid
  config_secret oauth_secret -s; echo

  config_env "OAUTH_REDIRECT_URI" .env
}

[ -d "$SECRET_DIR" ] && mkdir -p "$SECRET_DIR"

config_mongo

config_oauth
