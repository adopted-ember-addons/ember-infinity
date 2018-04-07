import { Serializer } from 'ember-cli-mirage';

export default Serializer.extend({
  serialize({ models }, request) {
    let subset = models;
    let perPage = parseInt(request.queryParams.per_page, 10);
    let startPage = parseInt(request.queryParams.page, 10);

    let pageCount = Math.ceil(subset.length / perPage);
    let offset = perPage * (startPage - 1);
    subset = subset.slice(offset, offset + perPage);

    return { posts: subset, meta: { total_pages: pageCount } };
  }
});
