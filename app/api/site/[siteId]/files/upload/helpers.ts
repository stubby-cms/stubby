const MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/apng": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const uploadToBunnyStorage = async (
  file: any,
  name: string,
  mime: string = "image/webp",
) => {
  try {
    const url = `https://la.storage.bunnycdn.com/stubby/${name}.${MIME_TYPES[mime]}`;

    const rest = await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        AccessKey: process.env.BUNNY_API_KEY!,
        "Content-Type": "application/octet-stream",
      },
    });

    const res = await rest.json();

    return {
      ...res.data,
      url: `${process.env.NEXT_PUBLIC_CDN_URL!}/${name}.${MIME_TYPES[mime]}`,
    };
  } catch (error) {
    console.log(error);
  }
};
