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

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((error) => next(error));
});
app.get("/info", (req, res, next) => {
  const time = new Date();
  Person.find({})
    .then((persons) => {
      res.send(
        `<p>Phonebook has info for ${persons.length} people</p><p>${time}</p>`
      );
    })
    .catch((error) => next(error));
});
app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});
app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});
app.post("/api/persons", (req, res, next) => {
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
  Person.findOne({ name: person.name })
    .then((found) => {
      if (found) {
        res.status(403).send({ error: "name must be unique" }).end();
      } else {
        person
          .save()
          .then((result) => {
            res.status(200).send({ message: "Contact saved" }).end();

            //mongoose.connection.close();
          })
          .catch((error) => next(error));
      }
    })
    .catch((error) => next(error));
});
app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndUpdate(id, { number: req.body.number })
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});
const errorHandler = (error, req, res, next) => {
  console.log(error.name);
  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).send({ error: error.message });
  } else {
    return res.status(500).send({ error: "something went wrong" });
  }
};

app.use(errorHandler);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
