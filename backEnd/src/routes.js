const routes = require("express").Router();

const multer = require("multer");
const multerConfig = require("./config/multer");

const fs = require("fs");
const { promisify } = require("util");
const readdir = promisify(fs.readdir);

routes.post("/posts", multer(multerConfig).single("file"), (req, res, err) => {
  const {
    filename: name,
    size,
    location: url = `http://192.168.1.92:3000/files/${name}`,
  } = req.file;

  return res.json({ name, size, url });
});

routes.delete("/posts/:filename", (req, res) => {
  const fileName = req.params.filename; // ou pode usar req.body.filename
  const filePath = `tmp/uploads/${fileName}`;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: "Erro ao excluir arquivo." });
    }

    return res.send({ message: "Arquivo excluído com sucesso!" });
  });
});

routes.get("/posts", async (req, res) => {
  const files = await readdir("tmp/uploads");

  const fileInfos = await Promise.all(
    files.map(async (file) => {
      const stats = await promisify(fs.stat)(`tmp/uploads/${file}`);

      return {
        name: file,
        size: stats.size,
        url: `http://192.168.1.92:3000/files/${file}`,
      };
    })
  );

  return res.json({ files: fileInfos });
});

module.exports = routes;
