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
              Bits.Option({ text: '모두에게', value: 'all' })
            )
            .options([
              Bits.Option({ text: '모두에게', value: 'all' }),
              ...SOLDIER.map((soldier, index) => (
                Bits.Option({ text: soldier.name, value: index.toString() })
              ))
            ])
            .actionId('id')),
      Blocks.Input({ label: '편지 제목', blockId: 'title' })
      .element(
        Elements.TextInput({ placeholder: '제목을 입력해주세요' })
          .actionId('title')),
      Blocks.Input({ label: '편지 내용', blockId: 'content' })
        .element(
          Elements.TextInput({ placeholder: '내용을 입력해주세요', maxLength: 1300 })
            .multiline()
            .actionId('content'))
    ).buildToObject(),
    trigger_id: params.triggerId,
  }

  await callAPIMethod('views.open', messageData)
    
  return {
    statusCode: 200
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

  

  if (submitData.id.id.selectedOption.value === 'all') {
    const messageDatas = SOLDIER.map((v) => ({
      soldier: getSoldierData(v),
      title: `${submitData.title.title.value} by ${payload.user.name}`,
      content: submitData.content.content.value,
    }))

    try {
      const data = await Promise.all(messageDatas.map(async (data) => {
        try {
          const name = await sendMessage(
            data.soldier,
            data.title,
            data.content
          );
            
          return {
            name,
            success: true,
          }
        } catch {
          return {
            name: data.soldier.getName(),
            success: false,
          }
        }
      }));

      const message = {
        blocks: '',
        channel: payload.user.id
      };

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
            "text": data.find((v) => !v.success) ? '모두에게 편지를 보내지 못했습니다' : '모두에게 편지를 성공적으로 보냈습니다.\n',
            "emoji": true
          }
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": '*편지발송 결과*',
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
            "text": data.map((v) => `${v.name}: ${v.success ? '성공' : '실패'}`),
            "emoji": true
          }
        },
      ])
  
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
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": `오류가 발생했습니다 개발자에게 문의해주세요`,
                "emoji": true
              }
            },
            {
              "type": "divider"
            },
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "*내가 보낸 편지*"
              }
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
            },
            {
              "type": "divider"
            },
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": typeof e === 'object' ? '```' + JSON.stringify(e) + '```' : '```' + e + '```',
                "emoji": true
              }
            },
          ]),
        channel: payload.user.id
      }

      console.error(e)
      await callAPIMethod('chat.postMessage', message);
    }
  } else {
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
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": `오류가 발생했습니다 개발자에게 문의해주세요`,
                "emoji": true
              }
            },
            {
              "type": "divider"
            },
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "*내가 보낸 편지*"
              }
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
            },
            {
              "type": "divider"
            },
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": typeof e === 'object' ? '```' + JSON.stringify(e) + '```' : '```' + e + '```',
                "emoji": true
              }
            },
          ]),
        channel: payload.user.id
      }
      console.error(e)
      await callAPIMethod('chat.postMessage', message);
    }
  }
  return {
    statusCode: 200
  };
}