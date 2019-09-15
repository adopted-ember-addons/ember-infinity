import { find, settled } from '@ember/test-helpers';

export default async function assertDetails(assert, {title, listLength, reachedInfinity}) {
  let postsTitle     = find('#posts-title');
  let postList       = find('ul');
  let infinityLoader = find('.infinity-loader');

  await settled();

  assert.equal(postsTitle.textContent, title);
  assert.equal(postList.querySelectorAll('li').length, listLength);
  assert.equal(infinityLoader.classList.contains('reached-infinity'), reachedInfinity);
}
