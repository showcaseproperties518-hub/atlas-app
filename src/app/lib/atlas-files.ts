import { supabaseAdmin } from "@/app/lib/supabase-admin";

export async function uploadAtlasFile(file: File, folder = "journeys") {
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const { error } = await supabaseAdmin.storage
    .from("atlas-files")
    .upload(fileName, fileBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabaseAdmin.storage.from("atlas-files").getPublicUrl(fileName);

  return {
    path: fileName,
    publicUrl: data.publicUrl,
  };
}