import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import ArrayProxy from '@ember/array/proxy';

export default ArrayProxy.extend(PromiseProxyMixin);
