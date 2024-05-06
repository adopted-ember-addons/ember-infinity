import { find, findAll, waitUntil } from '@ember/test-helpers';

export default async function assertDetails(
  assert,
  { title, listLength, reachedInfinity }
) {
  await waitUntil(() => findAll('ul>li').length === listLength);

  const postsTitle = find('#posts-title');
  const postList = find('ul');
  const infinityLoader = find('.infinity-loader');

  assert.equal(postsTitle.textContent, title);
  assert.equal(postList.querySelectorAll('li').length, listLength);
  assert.equal(
    infinityLoader.classList.contains('reached-infinity'),
    reachedInfinity
  );
}
