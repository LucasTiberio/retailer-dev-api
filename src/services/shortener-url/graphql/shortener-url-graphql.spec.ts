process.env.NODE_ENV = 'test';
const app = require('../../../app');
const request = require('supertest').agent(app);
import Faker from 'faker';
import knexDatabase from '../../../knex-database';

const GET_ORIGINAL_URL_BY_CODE = `
    query getOriginalUrlByCode($input: GetOriginalUrlByCodeInput!) {
        getOriginalUrlByCode(input: $input)
    }
`

const backendRedirectUrl = process.env.REDIRECT_URL;

describe('shortener graphql', () => {

    test("anyone get shortener url by code graphql", async done => {

        const originalUrl = Faker.internet.url();
        const fakeShortId = "123456"
        const shortUrlBefore = `${backendRedirectUrl}/${fakeShortId}`;

        const [urlShorten] = await knexDatabase.knexConfig('url_shorten')
            .insert({
            original_url: originalUrl,
            short_url: shortUrlBefore,
            url_code: fakeShortId
            }).returning('*');

        const getOriginalUrlByCodePayload = {
            urlCode: urlShorten.url_code
        }

        const getOriginalUrlByCodeResponse = await request
        .post('/graphql')
        .set('content-type', 'application/json')
        .send({
        'query': GET_ORIGINAL_URL_BY_CODE, 
        'variables': {
                input: getOriginalUrlByCodePayload
            }
        });

        expect(getOriginalUrlByCodeResponse.statusCode).toBe(200);
        expect(getOriginalUrlByCodeResponse.body.data.getOriginalUrlByCode).toBe(originalUrl)

        done();

    });

});