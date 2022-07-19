# Sectigo / Comodo

Our code-signing certificate was purchased through Comodo which was bought by Sectigo.
It's a 3-year certificate, so it will expire July 5th 2025

# Usage

The certificate gets used in Appveyor during the build process. It signs our Windows build so that Windows doesn't reject Plottr or consider it a virus.
Each time we get a new certificate, Windows doesn't fully trust the certificate until we get a certain number of downloads/uses. We're not sure of that number and there's no official documentation around it. It could be hundreds or thousands ... no way to know.

There are two environment variables saved in our account in Appveyor that are named:
- CSC_LINK
- CSC_KEY_PASSWORD

## CSC_LINK
CSC_LINK is either a link to where the key file (.p12) is stored, but in our case it's the base64 string value of the key file (.p12)

## CSC_KEY_PASSWORD
CSC_KEY_PASSWORD is a password that we have set (and we have it stored in our LastPass account)


# Installation

## Download from Comodo/Sectigo

This has changed since the last time I did it (2022), so it may change again.

You can now download from macOS (used to have to be Windows).
As part of the download process, it asks you to create a password that you will need later.
You should also check the box to download the macOS compatible version.

It downloads 3 files:
- Fictional Devices ... cert ... .p12
- Fictional Devices ... cert ... key.pem
- Fictional Devices ... cert ... pub.pem

(Keep all three)

## Export from Keychain to usable format

Now, take that file and install it to your local Keychain (assuming macOS here) by double-clicking it. It should ask you for the password that youy set earlier.

Once installed, you should be able to see it under your My Certificates tab in Keychain named Fictional Devices, LLC and you'll see that you can drill down into it and see the private key within it.

Click the private key, right click, and export. It will ask you for a file name (can be whatever) and it will ask you to set a password. (Avoid bash special characters) This is the password that will be used for CSC_KEY_PASSWORD.

(If you don't export it from Keychain first, you'll end up with a base64 string that is way too long for Appveyor to handle. It can't be any longer than 8192 characters or it will throw an error)

## Make base64 string

For reference: [Electron Builder Docs](https://www.electron.build/code-signing#travis-appveyor-and-other-ci-servers)

In your terminal, run the following command:

`base64 -i <whatever you called the export>.p12 -o cert_base64.txt`

The `cert_base64.txt` can be anything you want it to be.

## "Install" in Appveyor

It's not really an installation, but:
1. Change the CSC_LINK value to the base64 text you just generated (copy/paste that file's contents).
1. Change the CSC_KEY_PASSWORD to the **password you chose when exporting from Keychain**.
1. Make sure you toggle the lock icon so that those values are hidden.


That should successfully sign Plottr builds
