const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  userId:{
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: String,
  qty: Number,
  price: Number,
  mode: String,
});

module.exports = { OrdersSchema };
