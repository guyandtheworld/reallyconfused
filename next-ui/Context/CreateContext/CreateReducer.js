import {
  ADD_MAP,
  REMOVE_MAP,
  SET_DESCRIPTION,
  SET_LINK,
  SET_NAME,
  SET_TYPE,
  SET_WHY,
  SET_DEFAULT,
  SET_DATE,
  SET_NEW,
  SET_ID,
  SET_INCOMPLETE,
} from "./types";

const insert = (arr, index, newItem) => [
  ...arr.slice(0, index),
  newItem,
  ...arr.slice(index),
];

function removeIndex(array, index) {
  array.splice(index, 1);
}

const CreateReducer = (state, action) => {
  switch (action.type) {
    case SET_TYPE: {
      let type = action.payload[0];
      let index = action.payload[1];
      let data = state.data;
      let obj = state.data[index];
      data[index] = { ...obj, type };
      return {
        ...state,
        data,
      };
    }

    case REMOVE_MAP: {
      let temp = state.data;
      removeIndex(temp, action.payload);
      return {
        ...state,
        data: [...temp],
      };
    }

    case ADD_MAP: {
      let temp = state.data;

      let pos = 0;
      let date = "";
      let completed = false;
      let insertPos = 0;

      if ((action.payload[1]) < 0) {
        // if this is the first step
        pos = state.data[action.payload[1] + 1].position - 1;
        date = state.data[action.payload[1] + 1].date;
        completed = state.data[action.payload[1] + 1].completed;
        insertPos = 0;
      } else if (action.payload[1] == state.data.length) {
        // if this is the last step
        pos = state.data[action.payload[1] - 1].position + 1;
        date = state.data[action.payload[1] - 1].date;
        completed = state.data[action.payload[1] - 1].completed;
        insertPos = action.payload[1];
      } else {
        pos = (state.data[action.payload[1] - 1].position +
          state.data[action.payload[1]].position) / 2
        date = state.data[action.payload[1] - 1].date
        completed = state.data[action.payload[1] - 1].completed
        insertPos = action.payload[1];
      }

      let final = insert(temp, insertPos, {
        position: pos,
        name: "",
        date: date,
        type: 0,
        link: "",
        description: "",
        completed: completed,
        new: true,
      });

      return {
        ...state,
        data: [...final],
      };
    }

    case SET_NAME: {
      let name = action.payload[0];
      let index = action.payload[1];
      let data = state.data;
      let obj = state.data[index];
      data[index] = { ...obj, name };
      return {
        ...state,
        data,
      };
    }

    case SET_LINK: {
      let link = action.payload[0];
      let index = action.payload[1];
      let data = state.data;
      let obj = state.data[index];
      data[index] = { ...obj, link };
      return {
        ...state,
        data,
      };
    }

    case SET_NEW: {
      let index = action.payload;
      let data = state.data;
      let obj = state.data[index];
      data[index] = { ...obj, new: false };
      return {
        ...state,
        data,
      };
    }

    case SET_INCOMPLETE: {
      let index = action.payload;
      let data = state.data;
      let obj = state.data[index];
      data[index] = { ...obj, completed: !state.data[index].completed };
      return {
        ...state,
        data,
      };
    }

    case SET_DATE: {
      let date = action.payload[0];
      let index = action.payload[1];
      let data = state.data;
      let obj = state.data[index];
      data[index] = { ...obj, date };
      return {
        ...state,
        data,
      };
    }

    case SET_DESCRIPTION: {
      let description = action.payload[0];
      let index = action.payload[1];
      let data = state.data;
      let obj = state.data[index];
      data[index] = { ...obj, description };
      return {
        ...state,
        data,
      };
    }

    case SET_ID: {
      let ID = action.payload[0];
      let index = action.payload[1];
      let data = state.data;
      let obj = state.data[index];
      data[index] = { ...obj, ID };
      return {
        ...state,
        data,
      };
    }

    case SET_DEFAULT: {
      let defData = action.payload[0];
      const newData = [];
      defData.map((x) => {
        let temp = {};
        temp.position = x.position;
        let date = new Date(x.date);
        temp.date = `${date.toLocaleString("default", {
          month: "short",
        })} ${date.getFullYear()}`;
        temp.type = x.step_id;
        temp.description = x.description_1;
        temp.name = x.title;
        temp.new = false;
        temp.step_type = x.stepType
        temp.completed = x.completed;
        temp.ID = x.id;
        newData.push(temp);
      });

      return {
        ...state,
        data: newData,
      };
    }

    case "CHECK_DATES": {
      let completed = action.payload;
      let today = new Date();
      let tempState = state.data;
      let latestDate = state.data[0].date;
      let ifPrevInComplete = false;

      state.data.map((x, i) => {
        if (completed) {
          let stepDate = new Date(x.date);
          if (stepDate > today) {
            tempState[i].date = today;
            tempState[i].completed = true;
          }
        }
      });
      return tempState;
    }
    default:
      return state;
  }
};

export default CreateReducer;
