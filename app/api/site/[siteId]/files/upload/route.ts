import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToBunnyStorage } from "./helpers";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as Blob;
  let path = formData.get("path") as string;
  const optimize = formData.get("optimize") as string;

  if (!file || !path) {
    return NextResponse.json(
      { success: false, error: "Missing file or path" },
      { status: 400 },
    );
  }

  try {
    let buffer = await file.arrayBuffer();
    let type = file.type;

    if (optimize != "false") {
      let sharpObj = sharp(await file.arrayBuffer()).resize(1200, 1200, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      });

      let sharpImg;

      switch (type) {
        case "image/png":
          sharpImg = sharpObj.png({ quality: 80 });
          break;
        case "image/jpeg":
        case "image/jpg":
          sharpImg = sharpObj.jpeg({ quality: 80 });
          break;
        default:
          sharpImg = sharpObj;
          break;
      }

      buffer = await sharpImg.toBuffer();
    }

    const { url } = await uploadToBunnyStorage(buffer, path, type);

    return NextResponse.json({
      success: true,
      url: url,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ success: false, error: error });
  }
}
