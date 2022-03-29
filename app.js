
import Twig from "twig";
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import pg from 'pg';

const app = express();
const cs = 'postgres://postgres:P0stgr35_p@ss@146.59.243.247:5432/odoo_V2';
const client = new pg.Client(cs);

app.use(cors());

client.connect();

// This section is optional and used to configure twig.
app.set("twig options", {
    allow_async: true, // Allow asynchronous compiling
    strict_variables: false
});

app.get('/', async (req, res) => {
    res.render('home.html.twig', {
        message: "",
    });
})

app.get('/api/full-order/', async (req, res) => {
    const orderLinesQuery = await client.query(`
        SELECT * 
        FROM pos_order_line pol 
        LEFT JOIN pos_order po ON pol.order_id = po.id 
        LEFT JOIN res_partner pa ON po.partner_id = pa.id
        ORDER BY po.id
    `)
        
    // import axios from 'axios';


    const orderLines = orderLinesQuery.rows;
    const formated_data = handleDataOrder(orderLines);
    res.json(formated_data);



})

app.get('/api/full-order/:email', async (req, res) => {
    const orderLinesQuery = await client.query(`
        SELECT * 
        FROM pos_order_line pol 
        LEFT JOIN pos_order po ON pol.order_id = po.id 
        LEFT JOIN res_partner pa ON po.partner_id = pa.id
        WHERE pa.email = '${req.params.email}'
        ORDER BY po.id
    `)
        
    // import axios from 'axios';


    const orderLines = orderLinesQuery.rows;
    const formated_data = handleDataOrder(orderLines);
    res.json(formated_data);



})
    
function handleDataOrder(data) {
    const arr = [];
    let order_index = 0;
    data.forEach(order => {
        if (!orderIsInArr(order.order_id, arr)) {
            arr.push({
                /* add yields here */
                id: order_index,
                order_id: order.order_id,
                products: [{
                    product_id: order.product_id,
                    full_product_name: order.full_product_name,
                    phone: order.phone
                    
                }],
                email: order.email
            });
            order_index++;
        } else {
            arr[order_index - 1].products.push({
                /* add yields here */
                product_id: order.product_id,
                full_product_name: order.full_product_name,
                phone: order.phone
                
            });
        }
    });
    return arr;
}

function orderIsInArr(id, arr) {
    let inArray = false;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].order_id === id) inArray = true;
    }
    return inArray;
}

app.get('/api/full-orders', async (req, res) => {
    const order = await client.query('SELECT * FROM pos_order_line pol LEFT JOIN pos_order po ON pol.order_id = po.id LEFT JOIN res_partner pa ON po.partner_id = pa.id')
    const orderLine = await client.query('SELECT * FROM pos_order')
forEach(orderLine => {
    if (orderLine.order_id == order.id) {
        order.push(orderLine);
    }
    })
    res.json(order.rows);
})

app.get('/api/orders', async (req, res) => {
    const result = await client.query('SELECT * FROM pos_order');
    res.json(result.rows);
})

app.get('/api/order-lines', async (req, res) => {
    const result = await client.query('SELECT * FROM pos_order_line');
    res.json(result.rows);
})

app.get('/api/products', async (req, res) => {
    const result = await client.query('SELECT * FROM product_product');
    res.json(result.rows);
})

app.get('/api/mail', async (req, res) => {
    const result = await client.query('SELECT * FROM mail_mail');
    res.json(result.rows);
})

app.get('/api/partner', async (req, res) => {
    const result = await client.query('SELECT * FROM res_partner');
    res.json(result.rows);
})

app.get('/api/users', async (req, res) => {
    const result = await client.query('SELECT * FROM mail_tracking_value')
    res.json(result.rows);
})




app.listen(3000, () => {
    console.log("Server up and running: http://localhost:3000")
})

