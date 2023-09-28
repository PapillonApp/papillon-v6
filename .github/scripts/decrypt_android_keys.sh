#!/bin/sh

gpg --quiet --batch --yes --decrypt --passphrase="$KEYS_SECRET_PASSPHRASE" \
--output android/fastlane/android_keys.zip android/fastlane/android_keys.zip.gpg && cd android/fastlane && unzip -j android_keys.zip && cd -