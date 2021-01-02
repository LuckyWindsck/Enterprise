const fs = require('fs')
const peg = require('pegjs')

const enterpriseComment = `/*©
  This code is property of Enterprise™.
©*/

`

const enterprisePeg = fs.readFileSync('./src/parser/enterprise.peg', 'utf8')

const source = peg.generate(enterprisePeg, {
  format: "commonjs",
  output: "source"
})

const output = enterpriseComment + source

fs.writeFileSync('./src/parser/enterprise.js', output, 'utf8')
