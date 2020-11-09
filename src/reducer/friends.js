import { ActionType } from '../actions/friends';

const YEARS_FROM_1970 = 50;
const DAYS_IN_YEAR = 365.24;
const MS_IN_DAY = 86400000;

const getAge = (date) => {
  if (!date) {
    return `не определен`;
  }

  const dateArr = date.split(`.`);
  const formatDate = dateArr.reverse().map(
    (el) => {
      if (el.length === 1) {
        return `0${el}`
      } else {
        return el;
      }
    }
  ).join(`-`);
  
  if (dateArr.length <= 2) {
    return `не определен`;
  } else {
    let age = Math.floor((+(Date.parse(formatDate)) / MS_IN_DAY) / DAYS_IN_YEAR);

    if (age < 0) {
      age = YEARS_FROM_1970 + (-age);
    }

    return age;
  }
};

const initialState = {
  filters: {
    age: ``,
    gender: ``,
    lastName: ``,
    name: ``,
  },
  friends: [],
  idFriends: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.PUSH_FRIENDS:
      const formatFriends = action.payload.map((friend) => {
        return ({
          avatar: friend[`photo_100`],
          age: getAge(friend[`bdate`]),
          gender: friend[`sex`],
          id: friend.id,
          lastName: friend[`last_name`],
          name: friend[`first_name`],
        });
      });
      return {
        ...state,
        friends: state['friends'].concat(formatFriends),
      };

    case ActionType.PUSH_FRIENDS_ID:
      return {
        ...state,
        idFriends: state['idFriends'].concat(action.payload)
      };

    case ActionType.SET_FILTERS:
      return {
        ...state,
        filters: action.payload,
      };

    default:
      return state;
  }
};

export {
  reducer,
};
