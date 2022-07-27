#!/usr/bin/env zx
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { reporter } from 'vfile-reporter';

async function markdownToHtml(text, options = {}) {
  return await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeDocument, options.document)
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
  return await markdownToHtml(text, { document: { title: name } });
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
