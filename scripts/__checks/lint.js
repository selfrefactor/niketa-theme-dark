let FALLBACK = 'src/create-multiple-theme.spec.js'
const filePath = process.argv[2] ?? FALLBACK

const execa = require('execa')
const { ESLINT, eslintConfig } = require("../constants")

const command = [
  ESLINT,
  '--fix',
  filePath,
  '--config',
  eslintConfig
].join(' ')

const dir = process.cwd()

void (async function lint() {
  const {stderr} = await execa.command(command, {cwd: dir})
  if(stderr){
    console.log(stderr)
  }else{
    console.log('OK')
  }
})()