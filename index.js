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

const ALLOWED_STYLES = ["apple", "google", "facebook", "twitter"];

const STYLE_TO_FOLDER = {
  apple: "img-apple-160",
  google: "img-google-136",
  facebook: "img-facebook-96",
  twitter: "img-twitter-72",
};

const leftPad = (string, length, character) => {
  return string.length >= length
    ? string
    : new Array(length - string.length + 1).join(character) + string;
};

const buildRedirectUrl = (style, path) => {
  return `https://cdn.jsdelivr.net/gh/iamcal/emoji-data/${STYLE_TO_FOLDER[style]}/${path}`;
};

const redirect = (url) => {
  return fetch(url, {
    headers: {
      "Cache-Control": `public, max-age=${60 * 60 * 24 * 7}, immutable`,
      "Access-Control-Allow-Origin": "*"
    },
  })
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, "");
    const style = url.searchParams.get("style") ?? "apple";

    if (path === "") {
      return new Response(`This is a CDN for emojis, try to add any emoji at the end of the url. like:
      
  ${url.href}👍
  
For more control, add the \`style\` query parameter to specify an emoji platform:

  ${url.href}🥳?style=google

If no \`style\` is provided, the API defaults to \`apple\`.

Supported styles:

  - \`apple\`
  - \`google\`
  - \`facebook\`
  - \`twitter\`

      
This project was made by https://github.com/benborgers/emojicdn, and hosted by https://github.com/jw-12138`, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        }
      });
    }

    if (path === "favicon.ico") {
      return new Response("");
    }

    if (path === "random") {
      const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];
      return redirect(buildRedirectUrl(style, randomEmoji.image));
    }

    if (!ALLOWED_STYLES.includes(style)) {
      return new Response(
        "Invalid style. Valid styles are: " + ALLOWED_STYLES.join(", "),
        { status: 400 }
      );
    }

    const emojiText = decodeURIComponent(path);
    const code = Array.from(emojiText)
      .map((char) => leftPad(char.codePointAt(0).toString(16), 4, "0"))
      .join("-");

    const emojiData = emoji.find(
      (e) =>
        e.unified.toLowerCase() === code.toLowerCase() ||
        // -feof just means "display as emoji"
        e.unified.toLowerCase() === code.toLowerCase().replace(/-fe0f$/g, "") ||
        e.unified.toLowerCase() === code.toLowerCase() + "-fe0f" ||
        e.name.toLowerCase().replace(/ /g, "-") === emojiText.toLowerCase()
    );

    if (!emojiData) {
      return new Response("Emoji not found", { status: 404 });
    }

    return redirect(buildRedirectUrl(style, emojiData.image));
  },
};
