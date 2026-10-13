# Android signing key

`debug.keystore` signs the StockVault APKs built by GitHub Actions
(`.github/workflows/apps.yml`). The workflow copies it to `~/.android/debug.keystore`,
the key Android's Gradle uses for debug builds.

The key is committed so that every build is signed the same way. Without it, each
CI run would generate a new random key, and Android would refuse to install a new
version over an old one.

This is a **debug** key: its passwords are the public Android defaults (`android`),
so it is only suitable for sideloaded test builds. Publishing to the Google Play Store
needs a private release key stored as a GitHub secret, not in the repository.
