import { beforeEach, describe, expect, it } from 'vitest'
import { readLocal, writeLocal } from './storage'

describe('local storage service',()=>{
  beforeEach(()=>localStorage.clear())
  it('writes and restores typed data',()=>{writeLocal('test',{name:'Growth OS',count:3});expect(readLocal('test',{name:'',count:0})).toEqual({name:'Growth OS',count:3})})
  it('returns fallback for damaged JSON',()=>{localStorage.setItem('broken','{oops');expect(readLocal('broken',['safe'])).toEqual(['safe'])})
})
