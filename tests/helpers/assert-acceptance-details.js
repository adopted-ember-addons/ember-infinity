export default function assertDetails(assert, {title, listLength, reachedInfinity}) {
  let postsTitle     = find('#posts-title');
  let postList       = find('ul');
  let infinityLoader = find('.infinity-loader');

  assert.equal(postsTitle.text(), title);
  assert.equal(postList.find('li').length, listLength);
  assert.equal(infinityLoader.hasClass('reached-infinity'), reachedInfinity);
}
