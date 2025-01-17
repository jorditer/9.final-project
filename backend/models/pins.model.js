import mongoose from "mongoose";

const PinSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      min: 3,
    },
    title: {
      type: String,
      require: true
    },
    location: {
      type: String,
      require: true
    },
    date: {
      type: Date,
      require: true
    },
    description: {
      type: String,
      require: true,
      min: 3,
    },
    price: {
      type: Number,
    },
    lat: {
      type: Number,
      require: true,
    },
    long: {
      type: Number,
      require: true
    }
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Pin = mongoose.model("Pin", PinSchema); // Create a model from the schema

export default Pin;
/*
[
{"name": "Muchachito", "location": "Salamandra", "description": "Description 1", "price": 20, "date": "2022-01-01"},
{"name": "Sunny Girls", "location": "Taro", "description": "Post perreo a las 10", "price": 10, "date": "2022-02-02"},
{"name": "Marina Bajona", "location": "Heliogabal", "description": "Tontipop", "price": 18, "date": "2022-03-03"},
{"name": "Rodriguez Rodriguez", "location": "VOL", "description": "Lo-fi", "price": 15, "date": "2022-05-07"},
{"name": "Home is Where", "location": "El pumarejo", "description": "Emo", "price": 25, "date": "2022-04-08"},
{"name": "Phoebe Bridgers", "location": "Apolo", "description": "Folk", "price": 38, "date": "2022-03-03"},
]
*/
