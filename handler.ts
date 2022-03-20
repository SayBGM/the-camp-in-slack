import { Message, Modal, Blocks, Elements, Bits } from 'slack-block-builder';
import { SOLDIER } from './data';
import { chunkString, parseData, wait } from './utils';
import { SlackParams } from './model';
import { callAPIMethod, getNickName, getSoldierData, sendMessage } from './api';
import { camelizeKeys } from 'humps';
import { Soldier } from 'the-camp-lib';
import { getFailMessageListTemplate, getSuccessMessage } from './template/message';


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
          Elements.TextInput({ placeholder: '내용을 입력해주세요, 1000자 이상일경우 알아서 분할되어 전송됩니다.' })
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

  const selectSolders = (
    submitData.id.id.selectedOption.value === 'all' ?
    SOLDIER :
    [SOLDIER[parseInt(submitData.id.id.selectedOption.value)]]
  )

  
  let title = `${submitData.title.title.value} by `;
  try {
    title += await getNickName(payload.user.id);
  } catch {
    title += payload.user.name;
  }

  const splitContent = chunkString(submitData.content.content.value, 1000);

  const messageDatas: {
    soldier: Soldier,
    title: string,
    content: string,
  }[] = [];

  selectSolders.map((soldier) => {
    splitContent.map((content, index) => {
      let resultTitle = title;
      if (splitContent.length > 1) {
        resultTitle += ` | ${index + 1}번째`;
      }
      messageDatas.push({
        soldier: getSoldierData(soldier),
        title: resultTitle,
        content,
      });
    })
  })

  let message = {
    blocks: '',
    channel: payload.user.id
  };

  const theads = [];

  const results = await Promise.all(messageDatas.map(async (data) => {
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
    } catch (e) {
      return {
        name: data.soldier.getName(),
        error: '```' + e.toString() + '```',
        message: {
          title: data.title,
          content: data.content
        },
        success: false,
      }
    }
  }));

  message.blocks = getSuccessMessage({
    responseResults: results.map((result) => result.success)
  })

  results.map((result) => {
    if (!result.success) {
      theads.push(getFailMessageListTemplate({
        name: result.name,
        title: result.message.title,
        content: result.message.content,
        errorMessage: result.error
      }))
    }
  })

  console.log(JSON.stringify(results));
  console.log(JSON.stringify(theads));

  const postMessageResult = await callAPIMethod('chat.postMessage', message);

  console.log(postMessageResult);

  await wait(300);

  await Promise.all(theads.map(async (thead) => {
    await wait(400);
    await callAPIMethod('chat.postMessage', {
      blocks: thead,
      channel: payload.user.id,
      thread_ts: postMessageResult.message.ts
    });
  }))

  return {
    statusCode: 200
  };
}