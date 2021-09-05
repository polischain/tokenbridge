#!/usr/bin/env bash

rm -rf flat
ROOT=contracts/

UPGRADEABILITY=upgradeability/
UPGRADEABILITY_FULLPATH="$ROOT""$UPGRADEABILITY"

ERC20_TO_NATIVE=upgradeable_contracts/erc20_to_native/
ERC20_TO_NATIVE_FULLPATH="$ROOT""$ERC20_TO_NATIVE"

ARBITRARY_MESSAGE=upgradeable_contracts/arbitrary_message/
ARBITRARY_MESSAGE_FULLPATH="$ROOT""$ARBITRARY_MESSAGE"

FLAT=flat/

iterate_sources() {
  files=$(ls "$1"*.sol)
  for file in $files; do
    file_name=$(basename "$file")
    npx hardhat flatten "$file" > "$2""$file_name"
  done
}

mkdir -p "$FLAT""$UPGRADEABILITY";

iterate_sources "$UPGRADEABILITY_FULLPATH" "$FLAT""$UPGRADEABILITY"

mkdir -p "$FLAT""$ERC20_TO_NATIVE";

iterate_sources "$ERC20_TO_NATIVE_FULLPATH" "$FLAT""$ERC20_TO_NATIVE"

mkdir -p "$FLAT""$ARBITRARY_MESSAGE";

iterate_sources "$ARBITRARY_MESSAGE_FULLPATH" "$FLAT""$ARBITRARY_MESSAGE"