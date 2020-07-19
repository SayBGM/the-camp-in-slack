import React from "react";
import { Soldier } from 'the-camp-lib';

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
      <Section>
        <Text type='mrkdwn' emoji>훈련병 선택</Text>
      </Section>
      <Input label="soldier">
        <RadioButtons action='radio-buttons'>
          { SOLDIER.map(({ name }, index) => {
            if (index === 0) {
              return (
                <Option value={index.toString()} selected>{name}</Option>
              )
            } else {
              <Option value={index.toString()}>{name}</Option>
            }
          })}
        </RadioButtons>
      </Input>
      <Divider />
      <Section>
        <Text type='mrkdwn' emoji>편지 제목</Text>
      </Section>
      <Input label='title'>
        <TextField action='title' placeholder='거긴 잘 지내시나요'/>
      </Input>
      <Section>
        <Text type='mrkdwn' emoji>편지 내용</Text>
      </Section>
      <Input label='message'>
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
  const [status, setStatus] = useState<State>('init');
  const [soldier, setSoldier] = useState<Soldier>(null);

  const openModal = useModal(
    'letterForm',
    Form,
    async ({ form }) => {
      try {
        setSoldier(getSoldierData(SOLDIER.find((_, index) => parseInt(form.soldier) === index)));

        if (soldier != null) {
          await sendMessage(soldier, `${form.title} by ${nickname}`, form.message);
          setStatus('submitted');
        } else {
          setStatus('failed')
        }
      } catch (e) {
        setStatus('failed')
      }
    },
    () => setStatus('canceled')
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
      { status === "canceled" && (
        <Section>
          <Text emoji>편지쓰기를 취소하셨군요... :sweat_smile:</Text>
          <Text emoji>다음에는 꼭 써주세요! :pray:</Text>
          <Actions>
            <Button
              style="primary"
              action="rest"
              onClick={() => setStatus("init")}
            >
              편지 다시쓰기
            </Button>
          </Actions>
        </Section>
      ) }
      { status === 'failed' && (
        <Section>
          <Text emoji>헉! 서버와 통신이 어렵습니다. :shocked_face_with_exploding_head:</Text>
          <Text emoji>개발자에게 제보해주시겠어요? :pray:</Text>
        </Section>
      ) }
      { status === 'submitted' && soldier != null && (
        <Section>
          <Text emoji>{soldier?.getName()}님께 편지를 보냈어요! :star-struck:</Text>
        </Section>
      ) }
    </Message>
  )
  
}

export default SendMessage;