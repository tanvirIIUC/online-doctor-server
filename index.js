const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.fgemqio.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const appointmentCollection = client.db("online_doctor").collection("appointmentOption");
        const bookingCollection = client.db("online_doctor").collection("booking");

        // get data from database
        app.get('/appointmentOption', async (req, res) => {
            const date = req.query.date;
            // console.log(date)
            const query = {}
            const option = await appointmentCollection.find(query).toArray();
            ///
            const bookingQuery = { appointmentDate: date }
            const alreadyBooked = await bookingCollection.find(bookingQuery).toArray()
            //
            option.forEach(opt => {
                const optionBooked = alreadyBooked.filter(book => book.treatment === opt.name)
                const bookedSlots = optionBooked.map(book => book.slot)
                const remainingSlots = opt.slots.filter(slo => !bookedSlots.includes(slo))
                opt.slots = remainingSlots
                // console.log(opt.name, remainingSlots.length )
            })
            res.send(option)
        })

        // post data in database
        app.post('/bookings', async (req, res) => {

            const booking = req.body;
            console.log(booking)
             
            const query = {
                appointmentDate: booking.appointmentDate,
                email : booking.email,
                treatment: booking.treatment
            }
            const alreadyBooked= await bookingCollection.find(query).toArray();

            if(alreadyBooked.length){
                const message = `you have already booking on ${booking.appointmentDate}`;
                return res.send({acknowledged : false,message})
            }

            const result = await bookingCollection.insertOne(booking);
            res.send(result)
        })
    }
    finally {

    }

}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})