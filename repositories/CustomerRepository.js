import BaseRepository from './BaseRepository';
import CustomerModel from '../models/Customer';

export class CustomerRepository extends BaseRepository {
    constructor(){
        super(CustomerModel);
    }

    save(customer){
        const model = new CustomerModel({
            firstname: customer.firstname,
            lastname: customer.lastname,
            email: customer.email
        });

        return super.save(model);
    }
}

export default new CustomerRepository();