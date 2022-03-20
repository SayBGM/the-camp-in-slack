interface GetSuccessMessageParams {
  responseResults: boolean[],
}

export const getSuccessMessage = ({
  responseResults
}: GetSuccessMessageParams) => {
  const blocks = [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "육군훈련소 편지봇입니다. :email:",
        "emoji": true
      }
    },
    {
      "type": "section",
      "text": {
        "type": "plain_text",
        "text": responseResults.filter((v) => !v).length > 0 ? '일부 편지를 보내지 못했습니다' : '모두에게 편지를 성공적으로 보냈습니다.\n',
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": '편지발송 결과',
      }
    },
    {
      "type": "section",
      "text": {
        "type": "plain_text",
        "text": `${responseResults.filter((v) => v).length}개 성공`,
      }
    },
  ];

  return JSON.stringify(blocks);
}

interface GetFailMessageListTemplateParams {
  name: string,
  title: string,
  content: string,
  errorMessage?: string,
}

export const getFailMessageListTemplate = ({
  name,
  title,
  content,
  errorMessage,
}: GetFailMessageListTemplateParams) => {
  const blocks = [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": '보내지 못한 편지내용',
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*받는사람 |* ${name}`,
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*제목 |* ${title}\n\`\`\`${content}\`\`\``,
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": '오류 메세지',
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `${errorMessage || '알 수 없는 오류로 인하여 실패하였습니다.'}`,
      }
    },
  ]

  return JSON.stringify(blocks);
}