var storage = require('electron-json-storage')

const USER_INFO_PATH = 'user_info'
const fakeData = {
  "success": true,
  "uses": 3,
  "purchase": {
    "id": "OmyG5dPleDsByKGHsneuDQ==",
    "product_name": "Plottr",
    "created_at": "2014-04-05T00:21:56Z",
    "full_name": "Leywa",
    "variants": "Mac",
    "refunded": false,
    "chargebacked": false,
    "custom_fields": [],
    "email": "leywa@gumroad.com"
  }
}

storage.set(USER_INFO_PATH, fakeData, function(err) {
  if (err) console.log(err)
  else console.log('dev license created')
})