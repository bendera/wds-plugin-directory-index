import { stat, readdir } from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const html = String.raw;

const fileIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="16"
  fill="currentColor"
>
  <path
    d="m13.85 4.44-3.28-3.3-.35-.14H2.5l-.5.5v13l.5.5h11l.5-.5V4.8l-.15-.36ZM13 5h-3V2l3 3ZM3 14V2h6v3.5l.5.5H13v8H3Z"
  />
  <path
    d="M3.01 8V2.002h5.978v3.5l.251.251.252.252h3.5v7.993H3.01Z"
    style="fill:#f2efdd;stroke-width:.013805;fill-opacity:1"
  />
  <path
    d="M10.009 3.51V2.022l1.484 1.484a452.71 452.71 0 0 1 1.484 1.488c0 .002-.668.003-1.484.003h-1.484z"
    style="fill:#cecaae;fill-opacity:1;stroke-width:.013805"
  />
</svg>`;

const folderIcon = html`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="16"
  height="16"
  viewBox="0 0 4.233 4.233"
>
  <path
    d="M3.834.794H2.037L1.812.569 1.72.529H.397L.265.661v2.91l.132.133h3.44l.132-.132V.926ZM3.699 3.04v.4H.524V1.852h1.188l.092-.04.228-.227h1.67v.397zm0-1.717h-1.72l-.093.04-.227.227H.527V.796h1.135l.224.225.096.04h1.72z"
    style="stroke-width:.264583"
  />
  <path
    d="M2.006 4.509V3.02h4.266l.43.429c.402.4.44.432.592.496l.163.068h6.521v.97H7.481l-.172.074c-.162.071-.196.1-.604.508l-.433.432H2.006Z"
    style="fill:#dfac34;stroke-width:.0220473;fill-opacity:1"
    transform="scale(.26458)"
  />
  <path
    d="M1.984 9.998V7.011h4.493l.162-.068c.152-.064.19-.096.604-.507l.44-.44h6.295v6.99H1.984Z"
    style="fill:#ffc745;fill-opacity:1;stroke-width:.0220473"
    transform="scale(.26458)"
  />
</svg>`;

const arrowUpIcon = html`<svg
  width="16"
  height="16"
  viewBox="0 0 16 16"
  xmlns="http://www.w3.org/2000/svg"
  fill="currentColor"
>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M13.854 7l-5-5h-.707l-5 5 .707.707L8 3.561V14h1V3.56l4.146 4.147.708-.707z"
  />
</svg>`;

async function getPageHTML(originalUrl, fullPath, fileNames) {
  let dirs = [];
  let files = [];

  try {
    for (const f of fileNames) {
      const s = await stat(fullPath + f);

      if (s.isDirectory()) {
        dirs.push(f);
      } else {
        files.push(f);
      }
    }
  } catch (e) {
    /* empty */
  }

  const dirPrefix = originalUrl.endsWith("/") ? originalUrl : originalUrl + "/";
  const parentDirLink = html`
    <li>
      <a href="${dirname(originalUrl)}">${arrowUpIcon}Parent Directory</a>
    </li>
  `;
  const dirList = dirs.sort().reduce((prev, current, index) => {
    return (prev += html`
      <li><a href="${dirPrefix}${current}">${folderIcon}${current}/</a></li>
    `);
  }, "");
  const fileList = files.sort().reduce((prev, current, index) => {
    return (prev += html`
      <li><a href="${dirPrefix}${current}">${fileIcon}${current}</a></li>
    `);
  }, "");

  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Index of ${originalUrl}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, system-ui, "Ubuntu",
              "Droid Sans", "Segoe WPC", "Segoe UI", sans-serif;
            margin: 0;
            padding: 30px;
          }

          h1 {
            margin-top: 0;
          }

          ul {
            font-size: 14px;
            padding: 0;
          }

          li {
            display: block;
          }

          li svg {
            display: block;
            height: 16px;
            margin-right: 4px;
            width: 16px;
          }

          li a {
            align-items: center;
            border-radius: 4px;
            color: inherit;
            display: flex;
            justify-content: flex-start;
            padding: 4px;
            text-decoration: inherit;
            width: 100%;
          }

          li a:hover {
            background-color: #dbeafe;
            outline: 1px solid #bfdbfe;
          }
        </style>
      </head>
      <body>
        <h1>Index of ${originalUrl}</h1>
        <ul>
          ${parentDirLink}${dirList}${fileList}
        </ul>
      </body>
    </html>
  `;
}

let rootDir;

export function directoryIndexPlugin() {
  return {
    name: "directory-index",
    async serverStart(args) {
      ({ rootDir } = args.config);
    },
    serve: async function (context) {
      if (
        context.response.status === 404 &&
        (context.path.endsWith("index.html") || context.path === "/")
      ) {
        const fp = path.join(rootDir, context.originalUrl);

        try {
          const s = await stat(fp);

          if (s.isDirectory()) {
            const dirContent = await readdir(fp);
            const fullPath = fp.endsWith("/") ? fp : fp + "/";
            const h = await getPageHTML(
              context.originalUrl,
              fullPath,
              dirContent
            );

            return { body: h };
          }
        } catch (e) {
          /* empty */
          return { body: e };
        }
      }
    },
  };
}
