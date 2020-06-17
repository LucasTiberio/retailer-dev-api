process.env.NODE_ENV = 'test';
import service from './service';
import UserService from '../users/service';
import Faker from 'faker';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import knexDatabase from '../../knex-database';

const backendUrl = process.env.BACKEND_URL_STAGING;

describe('shortener', () => {

    let trx : Transaction;

    let signUpCreated: ISignUpAdapted;

    
    let signUpPayload = {
        username: Faker.name.firstName(),
        email: Faker.internet.email(),
        password: "B8oneTeste123!"
    }
    
    let userToken : IUserToken;

    beforeAll(async () => {
        trx = await knexDatabase.knex.transaction(); 
    });

    afterAll(async () => {
        await trx.rollback();
        await trx.destroy();
        return new Promise(resolve => {
            resolve();
        }); 
    });

    beforeEach(async () => {
        await trx('users').del();
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
    })

    test("user should short url", async done => {

        const originalUrl = Faker.internet.url();

        const shortUrl = await service.shortenerUrl(originalUrl, trx);

        expect(shortUrl).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                originalUrl,
                shortUrl: `${backendUrl}/${shortUrl.urlCode}`,
                urlCode: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
        )

        done();

    });

    test("user should get url if exists", async done => {

        const originalUrl = Faker.internet.url();
        const fakeShortId = "123456"
        const shortUrlBefore = `${backendUrl}/${fakeShortId}`;

        await (trx || knexDatabase.knex)('url_shorten')
        .insert({
          original_url: originalUrl,
          short_url: shortUrlBefore,
          url_code: fakeShortId
        })
        .returning('*');

        const shortUrl = await service.shortenerUrl(originalUrl, trx);

        expect(shortUrl).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                originalUrl,
                shortUrl: shortUrlBefore,
                urlCode: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date)
            })
        )

        done();

    });

    test("anyone get shortener url by code", async done => {

        const originalUrl = Faker.internet.url();

        const shortUrl = await service.shortenerUrl(originalUrl, trx);

        const getOriginalUrl = await service.getOriginalUrlByCode(shortUrl.urlCode, trx);
        const [urlShortenFoundOnDB] = await (trx || knexDatabase.knex)('url_shorten').where('id', shortUrl.id).select('count');

        expect(urlShortenFoundOnDB.count).toBe(1);
        expect(getOriginalUrl).toBe(originalUrl)



        done();

    });

});