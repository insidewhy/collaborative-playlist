import { ShareDeezerPage } from './app.po'

describe('collaborative-playlist App', function() {
  let page: ShareDeezerPage

  beforeEach(() => {
    page = new ShareDeezerPage()
  })

  it('should display message saying app works', () => {
    page.navigateTo()
    expect(page.getParagraphText()).toEqual('app works!')
  })
})
