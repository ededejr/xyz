#!/usr/bin/env zx
import { JENKINS_URL } from '../_utils/url.mjs';

const { _: args, ...flags } = argv;

try {
  const res = await fetch(`${JENKINS_URL}/queue/api/json`);

  if (res.status !== 200) {
    console.log(`${res.status} ${res.statusText}`);
  } else {
    const data = await res.json();
    console.log(data);
  }
} catch (error) {
  console.error('Error while fetching Jenkins queue\n', error);
}