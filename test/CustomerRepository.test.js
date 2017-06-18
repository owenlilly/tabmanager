require('dotenv').config();
import mongoose from 'mongoose';
import assert from 'assert';
import CustomerModel from '../models/Customer';
import repo from '../repositories/CustomerRepository';


describe('CustomerRespository', () => {
    before(() => {
        mongoose.connect(process.env.MONGO_TEST_URL);
        mongoose.Promise = global.Promise;
    });

    after(() => {
        CustomerModel.remove({}, () => {});
        mongoose.disconnect();
    });

    describe('.save()', () => {
        it('should save new user to database', (done) => {
            const customer = {
                firstname: 'Test',
                lastname: 'User',
                email: 'test@user.com'
            };

            repo.save(customer).subscribe(c => {
                assert.notEqual(undefined, c);
                assert.notEqual(undefined, c._id);
                done();
            });
        });
    });
});
