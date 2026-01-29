import { find, findAll, waitUntil } from '@ember/test-helpers';

export default async function assertDetails(
  assert,
  { title, listLength, reachedInfinity },
) {
  await waitUntil(() => findAll('ul>li').length === listLength);

  const postsTitle = find('#posts-title');
  const postList = find('ul');
  const infinityLoader = find('.infinity-loader');

  assert.strictEqual(postsTitle.textContent, title);
  assert.strictEqual(postList.querySelectorAll('li').length, listLength);
  assert.strictEqual(
    infinityLoader.classList.contains('reached-infinity'),
    reachedInfinity,
  );
}
