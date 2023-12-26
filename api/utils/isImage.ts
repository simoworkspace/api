export const isImage = async (url: string) => {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");

    console.log(contentType);

    return contentType ? contentType.startsWith("image") : false;
};
