import Rx from 'rx';
import BaseRepository from './BaseRepository';
import SaleModel from '../models/Sale';


export class SaleRepository extends BaseRepository {
    constructor(){
        super(SaleModel);
    }

    save(obj){
        const model = new SaleModel({
            customer: obj.customerId,
            items: obj.items,
            total: obj.items.map(item => ((item.amount * item.price) - item.discount))
                                .reduce((sum, current) => {
                                    return sum + current;
                                }, 0),
            fromTab: obj.fromTab
        });

        return super.save(model);
    }
}

export default new SaleRepository();