export type ExpectedPetType = "dog" | "cat";

export type PetImageValidationResponse = {
  ok: boolean;
  expected_type: ExpectedPetType;
  predicted_type: "dog" | "cat" | "other";
  confidence: number;
  decision: "accept" | "warning" | "reject";
  message: string;
  imagenet_index: number;
};

const API_BASE_URL = "https://validador-de-mascotas.onrender.com";

export async function validatePetImage(
  imageUri: string,
  expectedType: ExpectedPetType
): Promise<PetImageValidationResponse> {
  const formData = new FormData();

  formData.append("expected_type", expectedType);
  formData.append("file", {
    uri: imageUri,
    name: "pet.jpg",
    type: "image/jpeg",
  } as any);

console.log("VALIDANDO IMAGEN => expectedType:", expectedType);

  const response = await fetch(`${API_BASE_URL}/validate-pet-image`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  console.log("RESPUESTA VALIDACION =>", data);

  if (!response.ok) {
    throw new Error(data?.detail || "No se pudo validar la imagen.");
  }

  return data;
}

console.log("USANDO BACKEND:", API_BASE_URL);


export async function validateManyPetImages(
  imageUris: string[],
  expectedType: ExpectedPetType
) {
  const results = await Promise.all(
    imageUris.map(async (uri) => {
      const result = await validatePetImage(uri, expectedType);
      return {
        uri,
        ...result,
      };
    })
  );

  return results;
}