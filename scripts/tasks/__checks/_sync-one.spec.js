let {checkDependantRepo, DEPENDANT_REPOS} = require('./check-dependant-repos')

jest.setTimeout(60 * 1000)
test('sync-one', async () => {
  const result = await checkDependantRepo(
    DEPENDANT_REPOS[0],
  )
  console.log(result, 'final')
})
