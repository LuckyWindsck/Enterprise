/*©
  This code is property of Enterprise™.
©*/

const fs = require('fs')
const enterprise = require('./parser/enterprise')

module.exports = (file) => {
  return enterprise.parse(fs.readFileSync(file, 'utf8'))
}
