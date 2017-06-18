import crypto from 'crypto';
import randomize from 'randomatic';
import Rx from 'rx';
import repo from '../repositories/ClerkRepository';

export class ClerkService {

    verifyAndGet(email, password){
        return repo.findOne({email: email})
                        .flatMap(clerk => {
                            if(!clerk){
                                return Rx.Observable.throw(new Error('Invalid email or password'))
                            } else {
                                return Rx.Observable.just(clerk);
                            }
                        })
                        .flatMap(clerk => {
                            if(clerk.password === this.hashPassword(password, clerk.salt)){
                                return Rx.Observable.just(clerk);
                            } else {
                                return Rx.Observable.throw(new Error('Invalid email or password'));
                            }
                        })
                        .map(clerk => {
                            // redact password and salt
                            clerk.password = '';
                            clerk.salt = '';
                            return clerk; 
                        });
    }

    register(clerk){
        // copy data to new object to preserve original values
        const clerkDto = Object.assign({}, clerk);

        clerkDto.salt = randomize('Aa0', 24);
        clerkDto.password = this.hashPassword(clerkDto.password, clerkDto.salt);

        return repo.findOne({email: clerkDto.email})
                        .flatMap(c => {
                            if(c){
                                return Rx.Observable.throw(new Error('Clerk already exists'));
                            }

                            return Rx.Observable.just(c);
                        })
                        .flatMap(u => repo.save(clerkDto));
    }

    hashPassword(password, salt){
        const hashed = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256');
        
        return hashed.toString('hex');
    }
}

export default new ClerkService();