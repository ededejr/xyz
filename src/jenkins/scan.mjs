#!/usr/bin/env zx
import { JENKINS_URL } from './_utils.mjs';

const { _: args, ...flags} = argv;
const { repo } = flags;

if (!repo) {
  console.log('No repo specified');
  process.exit();
}

try {
  const res = await fetch(`${JENKINS_URL}/multibranch-webhook-trigger/invoke?token=${repo}`);
  const json = await res.json();
  printTriggerResult(json);
} catch (error) {
  console.error('Error while triggering Jenkins job', error);
}

function printTriggerResult(result) {
  const status = chalk.whiteBright.bgGreenBright(result.status);
  let content = status.toUpperCase();

  if (result.status === 'ok') {
    const { data: { triggerResults } } = result;
    
    for (const key of Object.keys(triggerResults)) {
      const { triggered, id, url } = triggerResults[key];
      
      const formattedId = chalk.bgMagenta.whiteBright(id);
      const formattedTriggered = triggered ? chalk.bgGreenBright.whiteBright(triggered) : chalk.bgRedBright.whiteBright(triggered);
      const formattedUrl = chalk.dim(`${JENKINS_URL}/${url}`);
      content += ` ${formattedId} ${formattedTriggered} ${formattedUrl}`;
    }
  }

  console.log(content);
}