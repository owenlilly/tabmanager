import Rx from 'rx';
import tabRepo from '../repositories/TabRepository';
import saleRepo from '../repositories/SaleRepository';
import customerRepo from '../repositories/CustomerRepository';

export const LineItem = (name, price, amount, discount) => {
    if(typeof price !== 'number' || !(price instanceof Number)){
        price = parseFloat(price);
    }
    
    return {
        name: name,
        price: price,
        amount: amount || 1,
        discount: discount || 0
    };
};

export class TabManagerService {

    findCustomerOrError(customerId){
        return customerRepo.findById(customerId)
                    .flatMap(customer => {
                        if(!customer){
                            return Rx.Observable.throw(new Error('Customer not found for id: '+customerId));
                        }

                        return Rx.Observable.just(customer);
                    });
    }

    getTab(customerId){
        //first ensure that the customer exists
        return this.findCustomerOrError(customerId)
                    .flatMap(customer => {
                        return tabRepo.findOne({customer: customer._id})
                                        .flatMap(tab => {
                                            if(!tab){
                                                // create new customer tab if one doesn't exist
                                                return tabRepo.save({
                                                    customerId: customer._id,
                                                    balance: 0
                                                });
                                            }

                                            return Rx.Observable.just(tab);
                                        });
                    });
    }

    debitCustomerTab(customerId, lineItems){
        return saleRepo.save({
            customerId: customerId,
            items: lineItems,
            fromTab: true
        })
        .flatMap(saleRecord => {
            return this.getTab(saleRecord.customer)
                        .map(tab => {
                            return {
                                tabId: tab._id,
                                newBalance: tab.balance - saleRecord.total
                            };
                        })
                        .flatMap(result => {
                            return tabRepo.updateBalance(result.tabId, result.newBalance);
                        });
        });
    }

    creditCustomerTab(customerId, amount){
        if(typeof amount === 'string' || amount instanceof String){
            amount = parseFloat(amount);
        }

        return this.getTab(customerId)
                    .flatMap(tab => {
                        return tabRepo.updateBalance(tab._id, tab.balance + amount);
                    });
    }
}

export default new TabManagerService();