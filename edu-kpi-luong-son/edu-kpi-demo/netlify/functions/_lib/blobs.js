const { getStore } = require("@netlify/blobs");

// Store dùng chung cho toàn bộ file hồ sơ & văn bản (PDF/Word)
function fileStore() {
  return getStore("edu-files");
}

async function saveFile(key, base64, contentType) {
  const store = fileStore();
  const buffer = Buffer.from(base64, "base64");
  await store.set(key, buffer, { metadata: { contentType } });
  return key;
}

async function readFile(key) {
  const store = fileStore();
  const arrayBuffer = await store.get(key, { type: "arrayBuffer" });
  if (!arrayBuffer) return null;
  return Buffer.from(arrayBuffer).toString("base64");
}

async function deleteFile(key) {
  const store = fileStore();
  await store.delete(key);
}

module.exports = { saveFile, readFile, deleteFile };
