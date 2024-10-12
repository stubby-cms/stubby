import { absoluteUrl, getId } from "./utils";

export const uploadFile = async (file: File, siteId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", `${siteId}/${getId(6)}`);
  formData.append("optimize", "false");

  try {
    const response = await fetch(
      absoluteUrl(`/api/site/${siteId}/files/upload`),
      {
        method: "POST",
        body: formData,
      },
    );

    const json = response.json();

    if (response.ok) {
      return json;
    } else {
      return { error: true, reason: json };
    }
  } catch (err) {
    return { error: true, reason: err };
  }
};
