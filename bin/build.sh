#!/bin/bash

echo "building $npm_package_version..."
npm run build 1> /dev/null
cd ~/plottr_dist

echo "organizing..."
# move all the builds to one folder
mkdir $npm_package_version
mv Plottr-darwin-x64 $npm_package_version/OSX
# mv Plottr-win32-ia32 $npm_package_version/win32
# mv Plottr-win32-x64 $npm_package_version/win64

echo "zipping..."
# zip all the builds
# tar -zcf Plottr-$npm_package_version.tar.gz $npm_package_version/OSX/Plottr.app 1> /dev/null
hdiutil create -format UDZO -srcfolder $npm_package_version/OSX/Plottr.app Plottr-$npm_package_version.dmg 1> /dev/null
zip -r -X Plottr-$npm_package_version-win64.zip $npm_package_version/win64 1> /dev/null
zip -r -X Plottr-$npm_package_version-win32.zip $npm_package_version/win32 1> /dev/null

echo "celebrating!"
