/*

Mersenne Twister in JavaScript based on "mt19937ar.c"

 * JavaScript version by Magicant: Copyright (C) 2005 Magicant


 * Original C version by Makoto Matsumoto and Takuji Nishimura
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/mt.html

Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
All rights reserved.

*/
const W = 32
const N = 624
const M = 397
const R = 31
const U = 11
const S = 7
const T = 15
const L = 18
const A = 0x9908B0DF
const B = 0x9D2C5680
const C = 0xEFC60000

const UPPER_MASK = parseInt([...Array(W - R)].map(() => '1').reduce((x, y) => x + y).concat([...Array(R)].map(() => '0').reduce((x, y) => x + y), ''), 2)
const LOWER_MASK = parseInt([...Array(W - R)].map(() => '0').reduce((x, y) => x + y).concat([...Array(R)].map(() => '1').reduce((x, y) => x + y), ''), 2)

const mulUint32 = (a: number, b: number): number => {
  const a1 = a >>> 16, a2 = a & 0xffff;
  const b1 = b >>> 16, b2 = b & 0xffff;
  return (((a1 * b2 + a2 * b1) << 16) + a2 * b2) >>> 0;
}
export type RandGen = {
  i: number;
  x: number[];
}

export const newRandGen = (seed: number): RandGen => {
  let state: RandGen = {i: 0, x: [seed >>> 0]}
  for (let j = 1; j < N; j++){
    state.x[j] = (mulUint32(1812433253, state.x[j-1] ^ (state.x[j-1] >>> 30)) + j)
  }
  return state
}

export const randNext = (state: RandGen): [number, RandGen] => {
  const newi = (state.i + 1) % N
  const z = state.x[state.i] & UPPER_MASK | state.x[newi] & LOWER_MASK
  const newx = [...state.x, state.x[(state.i + M) % N] ^ (z >>> 1) ^ ((z & 1) == 0 ? 0 : A)]
  const newState: RandGen = {i: newi, x:newx}

  let y = newState.x[newState.i]
  y = y ^ (y >>> U)
  y = y ^ ((y << S) & B)
  y = y ^ ((y << T) & C)
  y = y ^ (y >>> L)

  return [y >>> 0, newState]
}

export const randRange = (min: number, sup_: number, state: RandGen): [number, RandGen] => {
  const sup = sup_ - min
  if (!(0 < sup && sup < 0x100000000)){
    const [n, newState] = randNext(state)
    return [n + min, newState]
  }
  if ((sup & (~sup + 1)) == sup){
    const [n, newState] = randNext(state)
    return [((sup - 1) & n) + min, newState]
  }
  let [n, newState] = randNext(state)
  while(sup > 4294967296 - (n - (n %= sup))){
    const [n_, newState_] = randNext(newState)
    n = n_
    newState = newState_
  }
  return [n + min, newState]
}
