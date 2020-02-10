import { newE2EPage } from '@stencil/core/testing';

describe('note-detail', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<note-detail></note-detail>');
    const element = await page.find('note-detail');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
