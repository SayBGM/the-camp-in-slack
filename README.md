# 육군훈련소 비공식 슬랙 봇
육군훈련소 편지 보내는 비공식 슬랙 봇입니다.
[the-camp-lib](https://github.com/parksb/the-camp-lib)의 도움을 굉장히 많이 받았습니다. 정말 감사드립니다.

## 설치
```
sudo npm -i serverless -g
npm i
```

## 설정
* .env 파일에 슬랙 토큰과 시크릿키, 더캠프 아이디와 비밀번호를 입력해주세요.
* data.ts파일에 이름, 생년월일, 입소날짜등을 type에 맞게 적어주세요.


## 배포
1. aws-cli를 통해 `aws configure`를 완료해주세요.
2. 완료되었다면 sls deploy -v 를 통해 aws에 배포해주세요.

## 슬랙 필요 권한
* chat:write
* commands

## 슬랙 설정 방법
1. slash commands에서 새 커맨드를 만들어주세요.
2. Request URL에는 `https://${배포한 주소}/${stage}/open-modal`를 넣어주세요
3. Interactivity의 Request URL에는 `https://${배포한 주소}/${stage}/interactions`를 넣어주세요
