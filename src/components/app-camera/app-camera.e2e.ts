import { newE2EPage } from '@stencil/core/testing';

describe('app-camera', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<app-camera></app-camera>');
    const element = await page.find('app-camera');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
