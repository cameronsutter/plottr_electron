#!/bin/bash

echo "building $npm_package_version..."
npm run build 1> /dev/null
cd ~/plottr_dist

echo "organizing..."
# move all the builds to one folder
mkdir $npm_package_version
cp -R Plottr-darwin-x64 $npm_package_version/macOS && rm -R Plottr-darwin-x64
cp -R Plottr-win32-ia32 $npm_package_version/win32 && rm -R Plottr-win32-ia32
cp -R Plottr-win32-x64 $npm_package_version/win64 && rm -R Plottr-win32-x64

echo "zipping..."
# zip all the builds
# tar -zcf Plottr-$npm_package_version.tar.gz $npm_package_version/macOS/Plottr.app 1> /dev/null
hdiutil create -format UDZO -srcfolder $npm_package_version/macOS/Plottr.app Plottr-$npm_package_version.dmg 1> /dev/null
zip -r -X Plottr-$npm_package_version-win64.zip $npm_package_version/win64 1> /dev/null
zip -r -X Plottr-$npm_package_version-win32.zip $npm_package_version/win32 1> /dev/null

echo "celebrating!"
