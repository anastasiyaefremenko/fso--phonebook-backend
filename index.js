const express = require("express");
const mongoose = require("mongoose");
var morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/phonebook.js");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("body", function (req, res) {
  const { id, ...withoutId } = req.body;
  return JSON.stringify(withoutId);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// let persons = [
//   {
//     id: "1",
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: "2",
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: "3",
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: "4",
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});
app.get("/info", (req, res) => {
  const time = new Date();
  Person.find({}).then((persons) => {
    res.send(
      `<p>Phonebook has info for ${persons.length} people</p><p>${time}</p>`
    );
  });
});
app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  Person.findById(id).then((person) => {
    if (person) {
      res.json(person);
    } else {
      res.status(404).end();
    }
  });
});
app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  Person.findOneAndDelete(id).then(() => {
    res.status(204).end();
  });
});
app.post("/api/persons", (req, res) => {
  //const newId = Math.floor(Math.random() * 10000);
  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  });
  if (!person.name) {
    res.status(400).send({ error: "The name is missing" }).end();
    return;
  }
  if (!person.number) {
    res.status(400).send({ error: "The number is missing" }).end();
    return;
  }
  Person.findOne({ name: person.name }).then((found) => {
    console.log(found);
    if (found) {
      res.status(403).send({ error: "name must be unique" }).end();
    } else {
      person.save().then((result) => {
        res.status(200).send({ message: "Contact saved" }).end();

        mongoose.connection.close();
      });
    }
  });

  // const found = persons.find((p) => p.name === person.name);
  // if (found) {
  //   res.status(403).send({ error: "name must be unique" }).end();
  // }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
