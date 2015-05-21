import Something from '../something';

export function meaningOfLife() {
  new Something();
  throw new Error(42);
}

export function boom() {
  throw new Error('boom');
}
