const {
  checkDependantRepo,
  DEPENDANT_REPOS,
} = require('./check-dependant-repos')

jest.setTimeout(60 * 1000)
test('sync-all', async ()=> {
  const result = await Promise.all(DEPENDANT_REPOS.map(checkDependantRepo))
  console.log(result, 'final')
})
