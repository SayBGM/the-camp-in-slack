import dotenv from "dotenv";
import express from "express";
import { camelizeKeys } from "humps";

import Phelia from "phelia";
import bodyParser from 'body-parser';
import SendMessage from "./SendMessage";
import { SlackParams } from "./utils/model";

dotenv.config();

const app = express();
app.use((req, res, next) => {
  if (req.path !== '/interactions') {
    bodyParser.json()(req, res, next)
  } else {
    next();
  }
});
app.use((req, res, next) => {
  if (req.path !== '/interactions') {
    bodyParser.urlencoded({ extended: true })(req, res, next)
  } else {
    next();
  }
});
const port = 3000;

const client = new Phelia(process.env.SLACK_TOKEN);

client.registerComponents([SendMessage]);

const formatParams = (data: any) => {
  return camelizeKeys(data) as unknown as SlackParams
}

// Register the interaction webhook
app.post(
  "/interactions",
  client.messageHandler(process.env.SLACK_SIGNING_SECRET)
);

app.post(
  '/send-message',
  (req, res) => {
    const params = formatParams(req.body);
    client.postMessage(SendMessage, params.channelId, { nickname: params.userName });

    res.send({
      "text": "잠시만 기다려주세요.. 편지 템플릿을 불러오고 있습니다",
      "response_type": "ephemeral"
    });
  }
);

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`) 
});
