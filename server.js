require('dotenv').config();
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import customerRepo from './repositories/CustomerRepository';
import clerkService from './services/ClerkService';
import tms, { LineItem } from './services/TabManagerService';

mongoose.connect(process.env.MONGO_URL);
mongoose.Promise = global.Promise;

const app = express();
const PORT = process.env.PORT;

const getUsernameAndPassword = (req) => {
    let header   = req.headers['authorization'] || '',        // get the header
        token    = header.split(/\s+/).pop() || '',            // and the encoded auth token
        auth     = new Buffer(token, 'base64').toString(),    // convert from base64
        parts    = auth.split(/:/),                          // split on colon
        email    = parts[0],
        password = parts[1];

    return { email, password };
};

const authErrorHandler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
      if (!req.headers['authorization'] || req.headers['authorization'] === '') {
          res.status(401).json({error: 'No authorization token found'});
      } else {
          res.status(401).json({error: 'Invalid token'});
      }
  }
};

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(expressJwt({secret: process.env.JWT_SECRET}).unless({path: ['/login', '/register']}));
app.use(authErrorHandler);

app.get('/', (req, res) => {
    res.json({message: 'Ready!'});
});

app.post('/register', (req, res) => {
    clerkService.register(req.body)
    .map(clerk => {
        clerk.password = undefined;
        clerk.salt = undefined;
        clerk.__v = undefined;

        return clerk;
    })
    .subscribe(clerk => {
        res.json(clerk);
    }, err => {
        let statusCode = 500;
        if(err.message === 'Clerk already exists'){
            statusCode = 400;
        }
        
        res.status(statusCode).json({error: err.message});
    });
});

app.get('/login', (req, res) => {
    const auth = getUsernameAndPassword(req);

    clerkService.verifyAndGet(auth.email, auth.password)
    .subscribe(clerk => {
        res.json({
            token: jwt.sign({id: clerk._id}, process.env.JWT_SECRET)
        });
    }, err => {
        let statusCode = 500;
        if(err.message === 'Invalid email or password'){
            statusCode = 401;
        }

        res.status(statusCode).json({error: err.message});
    });
});

app.post('/customer/add', (req, res) => {
    customerRepo.save(req.body)
    .subscribe(c => {
        res.json(c);
    }, err => {
        res.status(500).json({error: err.message});
    })
});

app.post('/tab/credit', (req, res) => {
    const customerId = req.body.customerId;
    let amount = req.body.amount;

    if(typeof amount !== 'number' || !(amount instanceof Number)){
        amount = parseFloat(amount);
    }

    if(amount < 0){
        res.status(400).json({error: 'Amount cannot be negative'})
        return;
    }

    tms.creditCustomerTab(customerId, amount).subscribe(tab => {
        res.json({
            available: tab.balance
        });
    }, err => {
        res.status(500).json({error: err.message});
    });
});

app.post('/tab/debit', (req, res) => {
    const customerId = req.body.customerId;
    const items = req.body.items;
    let errNameCount = 0;
    let errPriceCount = 0;

    const lineItems = items.map(item => {
        if(!item.name || item.name.trim() === ''){
            errNameCount += 1;
        }
        if(!item.price || item.price <= 0 || item.price.trim() === ''){
            errPriceCount += 1;
        }

        const errors = [];
        if(errNameCount > 0){
            errors.push(`${errNameCount} item name${errNameCount > 1 ? 's':''} missing`);
        }

        if(errPriceCount > 0){
            errors.push(`${errPriceCount} item price${errPriceCount > 1 ? 's':''} missing`);
        }

        if(errors.length > 0){
            res.status(400).json({error: errors.join(', ')});
        }

        return new LineItem(item.name, item.price, item.amount, item.discount);
    });

    tms.debitCustomerTab(customerId, lineItems).subscribe(tab => {
        res.json({
            available: tab.balance
        });
    }, err => {
        res.status(500).json({error: err.message});
    });
});

app.listen(PORT, () => {
    console.log("listening on port %d", PORT);
});