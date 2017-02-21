#!/bin/bash

echo "packing..."
NODE_ENV=production node_modules/.bin/webpack 1> /dev/null

echo "building $npm_package_version $1..."
if [ "$1" = "TRIALMODE" ]; then
  trialmode=true
  npm run build -- TRIALMODE 1> /dev/null
else
  trialmode=false
  npm run build 1> /dev/null
fi

cd ~/plottr_dist

echo "organizing..."
# move all the builds to one folder
if [ $trialmode = true ]; then
  plottr_dir="$npm_package_version-TRIAL"
else
  plottr_dir=$npm_package_version
fi
echo "version: $plottr_dir"

mkdir $plottr_dir
cp -R Plottr-darwin-x64 $plottr_dir/macOS && rm -R Plottr-darwin-x64
cp -R Plottr-win32-ia32 $plottr_dir/win32 && rm -R Plottr-win32-ia32
cp -R Plottr-win32-x64 $plottr_dir/win64 && rm -R Plottr-win32-x64

echo "zipping..."
# tar -zcf Plottr-$plottr_dir.tar.gz $plottr_dir/macOS/Plottr.app 1> /dev/null
hdiutil create -format UDZO -srcfolder $plottr_dir/macOS/Plottr.app Plottr-$plottr_dir.dmg 1> /dev/null
zip -r -X Plottr-$plottr_dir-win64.zip $plottr_dir/win64 1> /dev/null
zip -r -X Plottr-$plottr_dir-win32.zip $plottr_dir/win32 1> /dev/null

echo "celebrating!"
