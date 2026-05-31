export async function uploadToImageKitFromBase64(base64: string) {
  const authRes = await fetch(
    "https://imagekit-auth.valenciajonathan325.workers.dev"
  );

  if (!authRes.ok) {
    const t = await authRes.text();
    throw new Error("Auth Worker error: " + t);
  }

  const { token, signature, expire } = await authRes.json();

  const fileName = `adopcion_${Date.now()}.jpg`;

  const form = new FormData();
  form.append("file", `data:image/jpeg;base64,${base64}`);
  form.append("fileName", fileName);
  form.append("publicKey", "public_DKg2duBatYqT4VhZFqp9lVEqwso=");
  form.append("token", token);
  form.append("signature", signature);
  form.append("expire", String(expire));
  form.append("folder", "/profiles");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error("Upload error: " + txt);
  }

  const data = await res.json();
  return data.url;
}

export async function uploadToImageKit(base64: string) {
  return uploadToImageKitFromBase64(base64);
}                                                                         