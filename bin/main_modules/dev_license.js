var storage = require('electron-json-storage')

const USER_INFO_PATH = 'user_info'
const fakeData = {
  "licenseKey": "e896854d5c786fb9b6b192b1736532bf",
  "success": true,
  "license": "valid",
  "item_id": 10333,
  "item_name": "Plottr &#8211; Install Files",
  "license_limit": 3,
  "site_count": 1,
  "expires": "2021-04-08 23:59:59",
  "activations_left": 2,
  "checksum": "f783c9752119906646ffa90f6a42d9eb",
  "payment_id": 8633,
  "customer_name": "Cameron Sutter",
  "customer_email": "cameronsutter0@gmail.com",
  "price_id": false
}

storage.set(USER_INFO_PATH, fakeData, function(err) {
  if (err) console.log(err)
  else console.log('dev license created')
})
