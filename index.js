import emojiDataset from "./emoji.json";

const emoji = [];

for (const e of emojiDataset) {
  emoji.push(e);
  if (e.skin_variations) {
    for (const v of Object.values(e.skin_variations)) {
      emoji.push({ ...e, ...v });
    }
  }
}

const leftPad = (string, length, character) => {
  return string.length >= length
    ? string
    : new Array(length - string.length + 1).join(character) + string;
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, "");

    if (path === "") {
      return Response.redirect("https://github.com/benborgers/emojicdn");
    }

    if (path === "favicon.ico") {
      return new Response("");
    }

    const emojiText = decodeURIComponent(path);
    const code = Array.from(emojiText)
      .map((char) => leftPad(char.codePointAt(0).toString(16), 4, "0"))
      .join("-");

    const emojiData = emoji.find(
      (e) => e.unified.toLowerCase() === code.toLowerCase()
    );

    if (!emojiData) {
      return new Response("Emoji not found", { status: 404 });
    }

    return Response.redirect(
      `https://cdn.jsdelivr.net/gh/iamcal/emoji-data/img-apple-160/${emojiData.image}`
    );
  },
};