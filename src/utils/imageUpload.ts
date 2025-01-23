const IMGBB_API_KEY = import.meta.env.IMGBB_API_KEY;

export async function uploadImageToImgBB(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", IMGBB_API_KEY);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "上传失败");
    }

    return data.data.url; // 返回图片直接访问链接
  } catch (error) {
    console.error("图片上传失败:", error);
    throw error;
  }
}
