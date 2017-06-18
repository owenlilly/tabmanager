require('dotenv').config();
import mongoose from  'mongoose';
import assert from 'assert';
import CustomerModel from '../models/Customer';
import SaleModel from '../models/Sale';
import TabModel from '../models/Tab';
import tms from '../services/TabManagerService';
import customerRepo from '../repositories/CustomerRepository';

describe('TabManagerService',() => {
    const CUSTOMER = {
        firstname: 'Test',
        lastname: 'Customer',
        email: 't@est.com'
    };

    before((done) => {
        mongoose.connect(process.env.MONGO_TEST_URL);
        mongoose.Promise = global.Promise;

        customerRepo.save(CUSTOMER).subscribe(c => {
            CUSTOMER._id = c._id;
            done();
        });
    });

    after(() => {
        CustomerModel.remove({}, () => {});
        SaleModel.remove({}, () => {});
        TabModel.remove({}, () => {});
        mongoose.disconnect();
    });

    describe('.getTab()', () => {
        describe("tab doesn't exist", ()=> {
            it("should create customer tab", (done) => {
                tms.getTab(CUSTOMER._id).subscribe(tab => {
                    assert.notEqual(undefined, tab);
                    assert.notEqual(undefined, tab._id);
                    assert.equal(tab.customer.toString(), CUSTOMER._id.toString());
                    assert.equal(tab.balance, 0);
                    done();
                }, err => {
                    assert.equal(undefined, err);
                    done();
                });
            });
        });

        describe("tab exists", () => {
            it("should return existing tab", (done) => {
                tms.getTab(CUSTOMER._id).subscribe(tab => {
                    assert.notEqual(undefined, tab);
                    assert.notEqual(undefined, tab._id);
                    assert.equal(tab.customer.toString(), CUSTOMER._id.toString());
                    assert.equal(tab.balance, 0);
                    done();
                }, err => {
                    assert.equal(undefined, err);
                    done();
                });
            });
        });
    });

    describe('.findCustomerOrError()', () => {
        describe('customer does not exist', () => {
            it('should return err', (done) => {
                tms.findCustomerOrError('5946198dddf5ab43031feb6b')
                    .subscribe(
                        () => {},
                        err => {
                            assert.notEqual(undefined, err);
                            assert.equal(err.message, 'Customer not found for id: 5946198dddf5ab43031feb6b');
                            done();
                        }
                    );
            });
        });

        describe('customer does exist', () => {
            it('should return customer', (done) => {
                tms.findCustomerOrError(CUSTOMER._id)
                    .subscribe(
                        c => {
                            assert.notEqual(undefined, c);
                            assert.equal(CUSTOMER._id.toString(), c._id.toString());
                            done();
                        },
                        err => {
                            assert.equal(undefined, err);
                            done();
                        }
                    );
            });
        });
    });

    describe('.debitCustomerTab()', () => {
        it("should reduce customers tab balance by sale total", (done) => {
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

            tms.debitCustomerTab(CUSTOMER._id, lineItems)
                .subscribe(tab => {
                    assert.notEqual(undefined, tab);
                    assert.equal(tab.customer.toString(), CUSTOMER._id.toString());
                    assert.equal(tab.balance, -70);
                    done();
                });
        });
    });

    describe('.creditCustomerTab()', () => {
        it('should add given amount to customer\'s tab', (done) => {
            tms.creditCustomerTab(CUSTOMER._id, 100)
                .subscribe(tab => {
                    assert.notEqual(undefined, tab);
                    assert.equal(tab.customer.toString(), CUSTOMER._id.toString());
                    assert.equal(tab.balance, 30);
                    done();
                });
        });
    });
});