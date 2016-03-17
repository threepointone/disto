import peg from 'pegjs'
import fs from 'fs'

const grammar = fs.readFileSync(__dirname + '/ql.pegjs', 'utf8')
const script = peg.buildParser(grammar, { output: 'source' })
fs.writeFileSync(__dirname + '/parser.js', 'module.exports =' + script, 'utf8')

console.log('written to ./src/parser.js')  // eslint-disable-line no-console

