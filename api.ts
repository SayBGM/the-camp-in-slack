import axios from 'axios';
import { stringify } from 'querystring';
import * as thecamp from 'the-camp-lib';
const apiUrl = 'https://slack.com/api';

export const getSlackInfo = async (method: string, params: {[key: string]: string}) => {
  const result = await axios.get(`${apiUrl}/${method}?${stringify(params)}`, {
    headers: { Authorization: "Bearer " + process.env.SLACK_TOKEN }
  });
  return result.data;
}

export const callAPIMethod = async (method, payload) => {
  const result = await axios.post(`${apiUrl}/${method}`, payload, {
    headers: { Authorization: "Bearer " + process.env.SLACK_TOKEN }
  });

  return result.data;
}

interface UserInfo {
  ok: boolean,
  user: {
      id: string,
      team_id: string,
      name: string,
      deleted: boolean,
      color: string,
      real_name: string,
      tz: string,
      tz_label: string,
      tz_offset: number,
      profile: {
          title: string,
          phone: string,
          skype: string,
          real_name: string,
          real_name_normalized: string,
          display_name: string,
          display_name_normalized: string,
          fields: null,
          status_text: string,
          status_emoji: string,
          status_expiration: number,
          avatar_hash: string,
          image_original: string,
          is_custom_image: true,
          first_name: string,
          last_name: string,
          image_24: string,
          image_32: string,
          image_48: string,
          image_72: string,
          image_192: string,
          image_512: string,
          image_1024: string,
          status_text_canonical:string,
          team: string,
      },
      is_admin: boolean,
      is_owner: boolean,
      is_primary_owner: boolean,
      is_restricted: boolean,
      is_ultra_restricted: boolean,
      is_bot: boolean,
      is_app_user: boolean,
      updated: number,
      is_email_confirmed: boolean
  }
}

export const getNickName = async (userHash: string): Promise<string> => {
  const data = await getSlackInfo(
    'users.info', {
    user: userHash
  }) as UserInfo;

  if (data?.user.profile.display_name == '') {
    return data?.user.profile.real_name;
  }

  return `${data?.user.profile.display_name} (${data?.user.profile.real_name})`
}

export const getSoldierData = ({
    name,
    birth,
    enterDate,
    className,
    groupName,
    unitName,
    relationship,
  }: {
    name: string,
    birth: string,
    enterDate: string,
    className: thecamp.SoldierClassName,
    groupName: thecamp.SoldierGroupName,
    unitName: thecamp.SoldierUnitName,
    relationship: thecamp.SoldierRelationship,
  }) => {
    return new thecamp.Soldier(
      name,
      birth,
      enterDate,
      className,
      groupName,
      unitName,
      relationship,
    )
  }
  
  export const loginTheCamp = async () => {
    try {
      const client = new thecamp.Client();
    
      await client.login(process.env.ID, process.env.PASSWORD);
  
      return client;
    } catch (e) {
      console.error(e);
    }
  }
  
  export const getSoldier = async (cookie: thecamp.Cookie ,soldier: thecamp.Soldier) => {
    const data = await thecamp.fetchSoldiers(cookie, soldier);
  
    return data;
  }
  
  export const sendMessage = async (
    soldier: thecamp.Soldier,
    title: string,
    content: string,
  ) => {
    try {
      const client = await loginTheCamp();
      const selectSoldier = await getSoldier(client.cookies, soldier);
      const message = new thecamp.Message(title, 
        content.replace(/\n/g, '<br />')
      , selectSoldier[0]);


      await thecamp.sendMessage(client.cookies, selectSoldier[0], message);

      return selectSoldier[0].getName();
    } catch (e) {
      throw new Error(e);
    }
  }