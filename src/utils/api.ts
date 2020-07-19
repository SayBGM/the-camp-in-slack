import * as thecamp from 'the-camp-lib';
import dotenv from 'dotenv';

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
  
    await client.login(process.env.ID, process.env.password);

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
    const client = await loginTheCamp();
    const [trainee] = await getSoldier(soldier);
    const message = new thecamp.Message(title, content, trainee);

    await client.sendMessage(trainee, message);
  } catch (e) {
    console.error(e);
  }
}