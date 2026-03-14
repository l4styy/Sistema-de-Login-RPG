console.log("ARQUIVO QUE O VS CODE ESTÁ EDITANDO");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const fichasRouter = require("./routes/fichas");


// importa o DB
require("./database/db");

const app = express();

app.use("/fichas", require("./routes/fichas"));

// 1. Arquivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// 2. CORS (permite cookies)
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// 3. Parsers
app.use(express.json());
app.use(cookieParser());

// 4. Rotas
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);

// rota raiz
app.get("/", (req, res) => res.send("API do Ficha 2.0 rodando"));

// 5. Iniciar servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
