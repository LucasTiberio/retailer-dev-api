process.env.NODE_ENV = 'test';

describe('auth', () => {
    test("empty", done => {
        expect(1).toBe(1);
        done();
    })
});