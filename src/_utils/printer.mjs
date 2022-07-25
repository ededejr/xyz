const SYMBOL = '☊';
const NAME = 'xyz';

export function printBanner() {
  const letterColor = '#f5f5f5';
  const symbolColor = chalk.bold.underline.hex('#fff5ee');
  const banner = chalk.hex(letterColor)(NAME);
  console.log(`${symbolColor(SYMBOL)} ${chalk.bold.italic(banner)}`);
}
