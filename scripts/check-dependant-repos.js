const { resolve } = require('path')

const DEPENDANT_REPOS = [
  '../../niketa-theme'
]

async function checkDependantRepo(relativePath) {
  const directoryPath = resolve(__dirname, relativePath)
  console.log(directoryPath)
  if(!existsSync(directoryPath)){
    return {error: `Directory ${ directoryPath } does not exist`}
  }
}

void async function checkDependantRepos(){
  const errors = await Promise.all(
    DEPENDANT_REPOS.map(checkDependantRepo)
  )
  console.log(errors)
}()