#!/usr/bin/env zx
import { getEnv } from "../_utils/env.mjs";
import { PORTAINER_URL } from "../_utils/url.mjs";

async function makeRequest() {
  try {
    const body = {
      username: getEnv("PORTAINER_USERNAME"),
      password: getEnv("PORTAINER_PASSWORD")
    };
    const res = await fetch(`${PORTAINER_URL}/api/auth`, {
      method: "post",
      body,
      headers: {'Content-Type': 'application/json'}
    });

    console.log(res);

    if (res.status !== 200) {
      console.log(`${res.url} ${res.status} ${res.statusText}`);
      process.exit();
    } else {
      console.log(res);
      console.log(res.json());
    }
  } catch (error) {
    console.log(error);
  }
}

makeRequest();

/*
const token = await question('Do you have GitHub token in env? ', {
  choices: Object.keys(process.env),
})

let headers = {}
if (process.env[token]) {
  headers = {
    Authorization: `token ${process.env[token]}`,
  }
  console.log(headers);
}
*/