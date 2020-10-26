import * as thecamp from 'the-camp-lib';

export const SOLDIER: {
  name: string,
  birth: string,
  enterDate: string,
  className: thecamp.SoldierClassName,
  groupName: thecamp.SoldierGroupName,
  unitName: thecamp.SoldierUnitName,
  relationship: thecamp.SoldierRelationship,
}[] = [
  { name: '홍길동1', birth: '20010101', enterDate: '20200820', className: '예비군인/훈련병', groupName: '육군', unitName: '육군훈련소', relationship: thecamp.SoldierRelationship.FAN },
  { name: '홍길동2', birth: '20010101', enterDate: '20200820', className: '예비군인/훈련병', groupName: '육군', unitName: '육군훈련소', relationship: thecamp.SoldierRelationship.FAN }
]