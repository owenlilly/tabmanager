require('dotenv').config();
import mongoose from 'mongoose';
import assert from 'assert';
import ClerkModel from '../models/Clerk';
import repo from '../repositories/ClerkRepository';


describe('ClerkRespository', () => {
    before(() => {
        mongoose.connect(process.env.MONGO_TEST_URL);
        mongoose.Promise = global.Promise;
    });

    after(() => {
        ClerkModel.remove({}, () => {});
        mongoose.disconnect();
    });

    describe('.save()', () => {
        it('should save new clerk to database', (done) => {
            const clerk = {
                firstname: 'Test',
                lastname: 'User',
                email: 'test@user.com',
                password: '123456'
            };

            repo.save(clerk).subscribe(c => {
                assert.notEqual(undefined, c);
                assert.notEqual(undefined, c._id);
                done();
            });
        });
    });
});
