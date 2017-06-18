import mongoose from 'mongoose';
import Rx from 'rx';

export function ErrNotFound(){
    this.message = 'Record not found';
}

export default class BaseRepository {

    constructor(model){
        this.model = model;
    }

    findById(id){
        return Rx.Observable.create(s => {
            this.model.findById(id, (err, result) => {
                if(err){
                    s.onError(err);
                } else {
                    s.onNext(result);
                }

                s.onCompleted();
            });
        });
    }

    remove(query){
        return Rx.Observable.fromPromise(this.model.remove(query));
    }

    removeAll(query){
        return Rx.Observable.fromPromise(this.model.remove(query, {justOne: false}));
    }

    findOne(query){
        const q = this.model.where(query);

        return Rx.Observable.create(s => {
            q.findOne((err, result) => {
                if(err){
                    s.onError(err);
                } else {
                    s.onNext(result);
                }

                s.onCompleted();
            });
        });
    }

    find(query){
        const q = this.model.where(query);

        return Rx.Observable.create(s => {
            q.find((err, result) => {
                if(err){
                    s.onError(err);
                } else if (!result){
                    s.onError(new ErrNotFound());
                } else {
                    s.onNext(result);
                }

                s.onCompleted();
            });
        });
    }

    save(model){        
        return Rx.Observable.fromPromise(model.save());
    }
}
