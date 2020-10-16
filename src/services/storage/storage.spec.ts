process.env.NODE_ENV = 'test';
import service from './service';
import UserService from '../users/service';
import Faker from 'faker';
import { Transaction } from 'knex';
import { ISignUpAdapted } from '../users/types';
import { IUserToken } from '../authentication/types';
import knexDatabase from '../../knex-database';
import { IOrganizationAdapted } from '../organization/types';
import OrganizationService from '../organization/service';
var imgGen = require('js-image-generator');
import redisClient from '../../lib/Redis';
import { createOrganizationPayload } from '../../__mocks__';

describe('Storage', () => {

    let trx : Transaction;

    let signUpCreated: ISignUpAdapted;

    
    let signUpPayload = {
        username: Faker.name.firstName(),
        email: Faker.internet.email(),
        password: "B8oneTeste123!"
    }
    
    let userToken : IUserToken;
    
    let organizationCreated: IOrganizationAdapted;

    beforeAll(async () => {
        trx = await knexDatabase.knexConfig.transaction(); 
    });

    afterAll(async () => {
        await trx.rollback();
        await trx.destroy();
        return new Promise(resolve => {
            resolve();
        }); 
    });

    beforeEach(async () => {
        await trx('users_organization_roles').del();
        await trx('users_organizations').del();
        await trx('organizations').del();
        await trx('users').del();
        signUpCreated = await UserService.signUp(signUpPayload, trx);
        userToken = { origin: 'user', id: signUpCreated.id };
        organizationCreated = await OrganizationService.createOrganization(createOrganizationPayload(), {client: userToken, redisClient}, trx);
    })

    test("should upload image", async done => {

        imgGen.generateImage(800, 600, 80, async function(err: Error, image : any) {
            const imageUploaded = await service.uploadImage("teste-upload2", image.data, "image/jpeg", trx);

            expect(imageUploaded).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    url: 'https://plugone-staging.nyc3.digitaloceanspaces.com/teste-upload2',
                    mimetype: 'image/jpeg',
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date)
                  })
            )
            done();
        });

    });

});