const fs = require("fs");
const https = require("https");
const path = require("path");
const modelUrl =
  "https://storage.googleapis.com/edubright-assets/models/bert_sentiment_model.h5";
const modelDirectory = path.join(__dirname, "..", "models");
const modelPath = path.join(modelDirectory, "bert_sentiment_model.h5");
const downloadModel = () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(modelDirectory)) {
      fs.mkdirSync(modelDirectory, {
        recursive: true,
      });
    }

    const file = fs.createWriteStream(modelPath);
    https
      .get(modelUrl, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          console.log("Model berhasil diunduh");
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(modelPath, () => {});
        reject(err);
      });
  });
};
const checkAndDownloadModel = async () => {
  if (fs.existsSync(modelPath)) {
    console.log("Model sudah ada, melewati proses pengunduhan.");
    return;
  }

  console.log("Model belum ada, mengunduh model...");
  await downloadModel();
};
module.exports = {
  checkAndDownloadModel,
};
