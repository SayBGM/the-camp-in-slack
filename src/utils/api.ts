import * as thecamp from 'the-camp-lib';
import dotenv from 'dotenv';
import showdown from 'showdown';


dotenv.config();

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

export const getSoldier = async (soldier: thecamp.Soldier) => {
  try {
    const client = await loginTheCamp();
    const data = await client.fetchSoldiers(soldier);
  
    return data;
  } catch (e) {
    console.error(e);
  }
}

export const sendMessage = async (
  soldier: thecamp.Soldier,
  title: string,
  content: string,
) => {
  try {
    const converter = new showdown.Converter();
    const client = await loginTheCamp();
    const selectSoldier = await getSoldier(soldier);
    const message = new thecamp.Message(title, converter.makeHtml(
      content.replace('\n', '<br /><br />')
    ), selectSoldier[0]);


    await client.sendMessage(selectSoldier[0], message);

    return selectSoldier[0].getName();
  } catch (e) {
    console.error(e);
  }
}