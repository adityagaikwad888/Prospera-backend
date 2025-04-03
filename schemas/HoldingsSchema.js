const { Schema} = require("mongoose");
mongoose = require("mongoose");

const HoldingsSchema = new Schema({
  userId:{
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: String,
  qty: Number,
  avg: Number,
});

module.exports = { HoldingsSchema };
