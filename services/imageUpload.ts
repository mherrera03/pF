export async function uploadToImageKit(fileUri: string) {
  const authRes = await fetch(
    "https://imagekit-auth.valenciajonathan325.workers.dev"
  );

  if (!authRes.ok) {
    const t = await authRes.text();
    throw new Error("Auth Worker error: " + t);
  }

  const { token, signature, expire } = await authRes.json();

  const form = new FormData();
  const fileName = `profile_${Date.now()}.jpg`;

  form.append("file", {
    uri: fileUri,
    name: fileName,
    type: "image/jpeg",
  } as any);

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