const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');


paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AbNd6C245n5Cra6jjhgjhgfjhgWyE4FnqJc7F4FxhP1lnnFuv6sNdI6D9fYOtvWs4dh6YO7S-IBGzq5WW0qvx',
  'client_secret': 'EIT0gyELE0VSx4i3HbLSvchfgcjkbkhbngf`NPuacCMDFhD5NA6EEyWGnb85aoqVed67l9LFYmI32VyzsHsAcCWpoUan0w'
});


const app = express();


app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
	const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "MI Band",
                "sku": "001",
                "price": "200",
                "currency": "INR",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "INR",
            "total": "200"
        },
        "description": "Band for the best hand ever."
    }]
};


paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0; i < payment.links.length; i++){
		if(payment.links[i].rel === 'approval_url'){
			res.redirect(payment.links[i].href);
		}
	} 
    }
});
});


app.get('/success', (req, res) => {
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;


	const execute_payment_json = {
		"payer_id": payerId,
		"transactions": [{
			"amount": {
				"currency": "INR",
				"total": "200"
			}
		}]
	};

	paypal.payment.execute(paymentId, execute_payment_json, function(error, payment){
		if(error){
			console.log(error.response);
			throw error;
		}else {
			console.log("Get Payment Response");
			console.log(JSON.stringify(payment));
			res.send('Success');
		}
	});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));


app.listen(3000, () => console.log('Server started successfully!!'));
