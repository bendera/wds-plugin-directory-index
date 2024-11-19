import { stat, readdir } from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const html = String.raw;

const fileIcon = html`<svg
  width="16"
  height="16"
  viewBox="0 0 16 16"
  xmlns="http://www.w3.org/2000/svg"
  fill="currentColor"
>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v4h4v8zm-3-9V2l3 3h-3z"
  />
</svg>`;

const folderIcon = html`<svg
  width="16"
  height="16"
  viewBox="0 0 16 16"
  xmlns="http://www.w3.org/2000/svg"
  fill="currentColor"
>
  <path
    d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10L14.5 3zm-.51 8.49V13h-12V7h4.49l.35-.15.86-.86H14v1.5l-.01 4zm0-6.49h-6.5l-.35.15-.86.86H2v-3h4.29l.85.85.36.15H14l-.01.99z"
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
            border-radius: 3px;
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
            outline-offset: -1px;
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

          return h;
        }
      } catch (e) {
        return e;
      }
    },
  };
}
