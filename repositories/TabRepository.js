import Rx from 'rx';
import BaseRepository from './BaseRepository';
import TabModel from '../models/Tab';


export class TabRepository extends BaseRepository {
    constructor(){
        super(TabModel);
    }

    updateBalance(tabOrCustomerId, newBalance){
        return Rx.Observable.fromPromise(this.model.findOneAndUpdate({
            $or: [
                { _id: tabOrCustomerId },
                { customer: tabOrCustomerId }
            ]
        }, {
            $set: { balance: newBalance }
        }, {
            new: true
        }));
    }

    save(tab){
        const newTab = new TabModel({
            customer: tab.customerId,
            balance: tab.balance
        });

        return super.save(newTab);
    }
}

export default new TabRepository();