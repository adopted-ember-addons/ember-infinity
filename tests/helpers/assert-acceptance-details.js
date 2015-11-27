export default function assertDetails(assert, {title, listLength, reachedInfinity}) {
  var postsTitle     = find('#posts-title');
  var postList       = find('ul');
  var infinityLoader = find('.infinity-loader');

  assert.equal(postsTitle.text(), title);
  assert.equal(postList.find('li').length, listLength);
  assert.equal(infinityLoader.hasClass('reached-infinity'), reachedInfinity);
}
