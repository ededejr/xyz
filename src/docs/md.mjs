#!/usr/bin/env zx
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { reporter } from 'vfile-reporter';
import rehypeSanitize from 'rehype-sanitize';

function githubMarkdownStyles() {
  return (tree) => {
    const html = tree.children.find((child) => child.tagName === 'html');
    const head = html.children.find((child) => child.tagName === 'head');

    head.children.push({
      type: 'element',
      tagName: 'style',
      children: [
        {
          type: 'text',
          value: `
            body {
              box-sizing: border-box;
              min-width: 200px;
              max-width: 980px;
              margin: 0 auto;
              padding: 45px;
            }
      
            @media (prefers-color-scheme: dark) {
              body {
                background-color: #0d1117;
              }
            }
          `,
        },
      ],
    });

    const body = html.children.find((child) => child.tagName === 'body');

    body.children = [
      {
        type: 'element',
        tagName: 'article',
        properties: { className: 'markdown-body' },
        children: body.children,
      },
    ];
  };
}

async function markdownToHtml(text, options = {}) {
  return await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeDocument, options.document)
    .use(githubMarkdownStyles)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(text);
}

function resolveRelativePath(source) {
  const fullPath = path.join(process.cwd(), source);
  const extension = path.extname(fullPath);
  const name = path.basename(fullPath).replace(extension, '');
  return { fullPath, extension, name };
}

async function readFileToText(filePath) {
  const fileContent = await fs.readFile(filePath);
  return fileContent.toString();
}

async function markdownFileToHtml(filePath) {
  const extension = path.extname(filePath);
  const name = path.basename(filePath).replace(extension, '');
  const text = await readFileToText(filePath);
  return await markdownToHtml(text, {
    document: {
      title: name,
      css: ['https://sindresorhus.com/github-markdown-css/github-markdown.css'],
    },
  });
}

async function htmlToFile(html, name, outputPath, prefix = '') {
  const report = reporter(html);
  let reportPrinter = chalk.dim;
  if (report !== 'no issues found') {
    reportPrinter = chalk.orange;
  }
  console.error(`${prefix}${reportPrinter(report)}`);
  const outFilePath = path.join(outputPath, `${name}.html`);
  await fs.writeFile(outFilePath, String(html), {
    recursive: true,
  });
  console.log(`${prefix}${chalk.green('✔')} ${outFilePath}`);
}

const { _: args, ...flags } = argv;

const source = flags['source'];
const pattern = flags['pattern'];

if (source) {
  const { fullPath, name } = resolveRelativePath(source);
  const html = await markdownFileToHtml(fullPath);
  await htmlToFile(html, name, process.cwd());
}

if (pattern) {
  const files = await glob(pattern);
  const promises = files.map((file) => async () => {
    const baseName = path.basename(file);
    const name = baseName.replace(path.extname(file), '');
    const html = await markdownFileToHtml(file);
    await htmlToFile(
      html,
      name,
      process.cwd(),
      `${chalk.dim(`[${baseName}]:`)} `
    );
  });

  await Promise.all(promises.map((p) => p()));
}
