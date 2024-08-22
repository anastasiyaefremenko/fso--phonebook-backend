const express = require("express");
var morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
morgan.token("body", function (req, res) {
  const { id, ...withoutId } = req.body;
  return JSON.stringify(withoutId);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});
app.get("/info", (req, res) => {
  const time = new Date();
  res.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${time}</p>`
  );
});
app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});
app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  persons = persons.filter((person) => person.id !== id);
  res.status(204).end();
});
app.post("/api/persons", (req, res) => {
  const newId = Math.floor(Math.random() * 10000);
  const person = req.body;
  if (!person.name) {
    res.status(400).send({ error: "The name is missing" }).end();
  }
  if (!person.number) {
    res.status(400).send({ error: "The number is missing" }).end();
  }
  const found = persons.find((p) => p.name === person.name);
  if (found) {
    res.status(403).send({ error: "name must be unique" }).end();
  }

  if (person.name && person.number && !found) {
    person.id = String(newId);
    persons = persons.concat(person);
    res.json(person);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
