require('dotenv').config();
import mongoose from  'mongoose';
import assert from 'assert';
import TabModel from '../models/Tab';
import repo from '../repositories/TabRepository';


describe('TabRepository', () => {
    before(() => {
        mongoose.connect(process.env.MONGO_TEST_URL);
        mongoose.Promise = global.Promise;
    });

    after(() => {
        TabModel.remove({}, () => {});
        mongoose.disconnect();
    });

    let tabId;
    describe('.save()', () => {
        it('should save a new tab to database', (done) => {
            const tab = {
                balance: 100
            };

            repo.save(tab).subscribe(t => {
                assert.notEqual(undefined, t);
                assert.notEqual(undefined, t._id);
                assert.equal(t.balance, 100);
                tabId = t._id;
                done();
            });
        });
    });

    describe('.updateBalance()', () => {
        it('should update tab balance using given tabId', (done) => {
            repo.updateBalance(tabId, 80).subscribe(t => {
                assert.notEqual(undefined, t);
                assert.notEqual(undefined, t._id);
                assert.equal(t.balance, 80);
                done();
            });
        });
    });
});