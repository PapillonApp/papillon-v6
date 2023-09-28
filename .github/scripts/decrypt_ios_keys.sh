#!/bin/sh

gpg --quiet --batch --yes --decrypt --passphrase="$KEYS_SECRET_PASSPHRASE" \
--output ios/App/AuthKey_QV8QQ622WD.p8 ios/App/AuthKey_QV8QQ622WD.p8.gpg