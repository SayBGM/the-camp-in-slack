import React from "react";

import {
  Modal,
  Message,
  Section,
  Actions,
  Button,
  PheliaMessageProps,
  Text,
  Divider,
  Input,
  Option,
  RadioButtons,
  TextField,
} from "phelia";
import { sendMessage, getSoldierData } from "./utils/api";
import { SOLDIER } from "./data";

type State = "submitted" | "canceled" | "init" | "failed";

type SendMessageProps = {
  nickname: string,
}

const Form = () => {
  return (
    <Modal title='편지 쓰기' submit='편지 전송'>
      <Input label="훈련병 선택">
        <RadioButtons action='soldier'>
          { SOLDIER.map(({ name }, index) => {
            if (index === 0) {
              return (
                <Option value={index.toString()} selected key={index}>{name}</Option>
              )
            } else {
              return (
                <Option value={index.toString()} key={index}>{name}</Option>
              )
            }
          })}
        </RadioButtons>
      </Input>
      <Divider />
      <Input label='편지 제목'>
        <TextField action='title' placeholder='거긴 잘 지내시나요'/>
      </Input>
      <Input label='편지 내용'>
        <TextField action='message' placeholder='거긴 잘 지내시나요' maxLength={1000} multiline/>
      </Input>
    </Modal>
  )
}

const SendMessage = ({
  useModal,
  useState,
  props: {
    nickname,
  }
}: PheliaMessageProps<SendMessageProps>) => {
  const [status, setStatus] = useState<State>('status', 'init');
  const [soldier, setSoldier] = useState<string>('soldier', null);

  const openModal = useModal(
    'letterForm',
    Form,
    async ({ form }) => {
      try {
        const selectSoldier = getSoldierData(SOLDIER.find((_, index) => parseInt(form.soldier) === index));

        if (selectSoldier != null) {
          const name = await sendMessage(selectSoldier, `${form.title} by ${nickname}`, form.message);
          setSoldier(name);
          setStatus('submitted');
        } else {
          setStatus('failed')
        }
      } catch (e) {
        setStatus('failed')
      }
    }
  );

  return (
    <Message text='육군훈련소 편지봇입니다. :email:'>
      <Section>
        <Text type='mrkdwn' emoji>*육군훈련소 편지봇입니다. :email:*</Text>
      </Section>
      { status === 'init' && (
        <Section>
          <Text type='mrkdwn' emoji>아래 편지쓰기 버튼을 눌러 편지를 보내주세요 :hugging_face:</Text>
        </Section>
      ) }
      <Divider />
      { status === 'init' && (
        <Actions>
          <Button
            style="primary"
            action="openModal"
            onClick={() => openModal()}
          >
            편지쓰기
          </Button>
        </Actions>
      ) }
      { status === 'failed' && (
        <Section>
          <Text emoji>헉! 서버와 통신이 어렵습니다. :shocked_face_with_exploding_head:</Text>
          <Text emoji>개발자에게 제보해주시겠어요? :pray:</Text>
        </Section>
      ) }
      { status === 'submitted' && (
        <Section>
          <Text emoji>{soldier}님께 편지를 보냈어요! :star-struck:</Text>
        </Section>
      ) }
    </Message>
  )
  
}

export default SendMessage;