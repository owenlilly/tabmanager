require('dotenv').config();
import mongoose from  'mongoose';
import assert from 'assert';
import ClerkModel from '../models/Clerk';
import clerkService from '../services/ClerkService';


describe('ClerkService', () => {
    before(() => {
        mongoose.connect(process.env.MONGO_TEST_URL);
        mongoose.Promise = global.Promise;
    });

    after(() => {
        ClerkModel.remove({}, () => {});
        mongoose.disconnect();
    });

    describe('.register()', () => {
        it('should save a new clerk to database and hash their password', (done) => {
            const clerk = {
                firstname: 'Test',
                lastname: 'Clerk',
                email: 'test_service@clerk.com',
                password: '123456'
            };

            clerkService.register(clerk).subscribe(c => {
                assert.notEqual(undefined, c);
                assert.notEqual(undefined, c._id);
                done();
            });
        });
    });
});