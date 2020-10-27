import { Message, Modal, Blocks, Elements, Bits } from 'slack-block-builder';
import { SOLDIER } from './data';
import { parseData } from './utils';
import { SlackParams } from './model';
import { callAPIMethod, getSoldierData, sendMessage } from './api';
import { camelizeKeys } from 'humps';


module.exports.openModal = async (event, context) => {
  const params = parseData<SlackParams>(event.body);

  const messageData = {
    view: Modal({ title: '훈련소로 편지보내기', submit: '편지 보내기' })
    .blocks(
      Blocks.Input({ label: '훈련병 선택', blockId: 'id' })
        .element(
          Elements.StaticSelect()
            .initialOption(
              Bits.Option({ text: SOLDIER[0].name, value: '0' })
            )
            .options(SOLDIER.map((soldier, index) => (
              Bits.Option({ text: soldier.name, value: index.toString() })
            )))
            .actionId('id')),
      Blocks.Input({ label: '편지 제목', blockId: 'title' })
      .element(
        Elements.TextInput({ placeholder: '제목을 입력해주세요' })
          .actionId('title')),
      Blocks.Input({ label: '편지 내용', blockId: 'content' })
        .element(
          Elements.TextInput({ placeholder: '내용을 입력해주세요', maxLength: 1000 })
            .multiline()
            .actionId('content'))
    ).buildToObject(),
    trigger_id: params.triggerId,
  }

  await callAPIMethod('views.open', messageData)
    
  return {
    statusCode: 200,
    body: Message({ text: '육군훈련소 편지봇입니다. :email:' })
    .blocks(
      Blocks.Section({ text: '육군훈련소 편지봇입니다. :email:' }),
      Blocks.Section({ text: '잠시만 기다려주세요!' })
    ).buildToJSON()
  };
}

module.exports.interactions = async (event) => {
  const data = parseData<{
    payload: string
  }>(event.body);
  const payload = camelizeKeys(JSON.parse(data.payload));

  const submitData: {
    content: {
      content: {
        type: string,
        value: string,
      }
    },
    id: {
      id: {
        selectedOption : {
          text: { 
            type: string,
            text: string,
          },
          value: string,
        }
        type: string,
      }
    },
    title: {
      title: {
        type: string,
        value: string,
      }
    }
  } = payload.view.state.values;

  const messageData = {
    soldier: getSoldierData(SOLDIER[parseInt(submitData.id.id.selectedOption.value)]),
    title: `${submitData.title.title.value} by ${payload.user.name}`,
    content: submitData.content.content.value,
  }

  try {
    const name = await sendMessage(
      messageData.soldier,
      messageData.title,
      messageData.content
    );

    const message = {
      blocks: '',
      channel: payload.user.id
    };

    if (name == null) {
      message['blocks'] = JSON.stringify([
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*육군훈련소 편지봇입니다. :email:*"
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": `오류가 발생했습니다 ㅠㅠㅠ`,
            "emoji": true
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": `${submitData.title.title.value}`,
            "emoji": true
          }
        },
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": `${submitData.content.content.value}`,
            "emoji": true
          }
        }
      ])
    } else {
      message['blocks'] = JSON.stringify([
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*육군훈련소 편지봇입니다. :email:*"
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": `${name}님께 편지를 보냈어요! :blob_yespls:`,
            "emoji": true
          }
        }
      ])
    }
  
    await callAPIMethod('chat.postMessage', message);
  } catch (e) {
    const message = {
      blocks: JSON.stringify([
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*육군훈련소 편지봇입니다. :email:*"
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": `오류가 발생했습니다 ㅠㅠㅠ`,
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": `${submitData.title.title.value}`,
              "emoji": true
            }
          },
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": `${submitData.content.content.value}`,
              "emoji": true
            }
          }
        ]),
      channel: payload.user.id
    }
    console.error(e)
    await callAPIMethod('chat.postMessage', message);
  }
  return {
    statusCode: 200
  };
}