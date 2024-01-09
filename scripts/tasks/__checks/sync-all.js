let {checkDependantRepo, DEPENDANT_REPOS} = require('./check-dependant-repos')

void (async function syncAll() {
  const result = await Promise.all(DEPENDANT_REPOS.map(checkDependantRepo))
  console.log(result, 'final')
})()

