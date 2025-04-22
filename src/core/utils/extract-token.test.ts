import { extractToken } from './extract-token';

describe('extract-tokn', () => {
  it('should extract the token', () => {
    expect(extractToken('Basic 123')).toEqual('123');
    expect(extractToken('Test 123')).toEqual(null);
    expect(extractToken('123123')).toEqual(null);
    expect(extractToken('')).toEqual(null);
  });
});
