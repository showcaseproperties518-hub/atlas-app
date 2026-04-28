import { createClient } from "@/app/lib/supabase-client";

export async function uploadPhoto(file: File, folder: string) {
  const supabase = createClient();

  const fileExt = file.name.split(".").pop() || "jpg";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();

  const fileName = `${Date.now()}-${safeName}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from("atlas-files")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("atlas-files").getPublicUrl(filePath);

  return data.publicUrl;
}