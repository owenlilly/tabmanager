require('dotenv').config();
import mongoose from  'mongoose';
import assert from 'assert';
import SaleModel from '../models/Sale';
import repo from '../repositories/SaleRepository';


describe('SaleRepository', () => {
    before(() => {
        mongoose.connect(process.env.MONGO_TEST_URL);
        mongoose.Promise = global.Promise;
    });

    after(() => {
        SaleModel.remove({}, () => {});
        mongoose.disconnect();
    });

    let tabId;
    describe('.save()', () => {
        it('should save a new sale to database', (done) => {
            const SaleItem = (name, price, amount, discount) => {
                return {
                    name: name,
                    price: price,
                    amount: amount || 1,
                    discount: discount || 0
                };
            }

            const lineItems = [
                new SaleItem('item1', 10, 3),
                new SaleItem('item2', 12, 3, 3),
                new SaleItem('item3', 7)
            ];

            const sale = {
                items: lineItems
            };

            repo.save(sale).subscribe(s => {
                assert.notEqual(undefined, s);
                assert.notEqual(undefined, s._id);
                assert.equal(s.total, 30+33+7);
                assert.equal(s.fromTab, false);
                assert.equal(s.items[0].name, 'item1');
                assert.equal(s.items[0].price, 10);
                assert.equal(s.items[0].amount, 3);
                assert.equal(s.items[0].discount, 0);
                assert.equal(s.items[1].discount, 3);
                assert.equal(s.items[2].amount, 1);
                assert.equal(s.items[2].name, 'item3');
                done();
            });
        });
    });
});