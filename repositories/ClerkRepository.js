import BaseRepository from './BaseRepository';
import ClerkModel from '../models/Clerk';


export class ClerkRepository extends BaseRepository {
    constructor(){
        super(ClerkModel);
    }

    save(clerk){
        const model = new ClerkModel({
            firstname: clerk.firstname,
            lastname: clerk.lastname,
            email: clerk.email,
            password: clerk.password,
            salt: clerk.salt
        });

        return super.save(model);
    }
}

export default new ClerkRepository();