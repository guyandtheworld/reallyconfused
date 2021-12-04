import CreateContext from "./CreateContext";
import React, { useReducer } from "react";
import {
  ADD_MAP,
  SET_DESCRIPTION,
  SET_NAME,
  SET_TYPE,
  SET_LINK,
  REMOVE_MAP,
  SET_DEFAULT,
  SET_DATE,
  SET_NEW,
  SET_ID,
  SET_INCOMPLETE,
} from "./types";

import router from "next/router";
import { Post, Get, Put, Delete } from "../../Utils/api";
import Lodash from "lodash";
import CreateReducer from "./CreateReducer";


const CreateState = (props) => {
  const initState = {
    data: [
      {
        stepType: "",
        completed: true,
        date: `${new Date().toLocaleString("default", {
          month: "short",
        })} ${new Date().getFullYear()}`,
        name: "",
        type: 0,
        link: "",
        position: 0,
        description: "",
        new: true,
        stepCreated: false
      },
    ],
  };

  const [state, dispatch] = useReducer(CreateReducer, initState);
  const [completed, setCompleted] = React.useState(true);
  const [tagRes, setTagRes] = React.useState("");
  const [roadmapID, setRoadmapID] = React.useState(0);
  const [roadmapPrivate, setRoadmapPrivate] = React.useState(false);
  const [roadmapTitle, setRoadmapTitle] = React.useState(false);
  const [simplified, setSimplified] = React.useState();
  const [stepsForDropdown, setStepsForDropdown] = React.useState([]);
  const [stepTypesForDropdown, setStepTypesForDropdown] = React.useState([]);
  const [called, setCalled] = React.useState(false);
  const [newMode, setNewMode] = React.useState(true);

  // for simplifying roadmaps, we get rid of step_type and url
  const genericStepTypeID = 58;
  const url = "";

  const saveMap = (data, index) => {
    dispatch({
      type: ADD_MAP,
      payload: [data, index],
    });
  };

  const removeMap = (index) => {
    if (!state.data[index].new) {
      Delete("roadmap/roadmapstep", { id: state.data[index].ID });
    }
    dispatch({
      type: REMOVE_MAP,
      payload: index,
    });
  };

  const setName = (data, index) => {
    dispatch({
      type: SET_NAME,
      payload: [data, index],
    });
  };

  const dateValidation = (index) => {
    let date = new Date(state.data[index].date);
    let status = !state.data[index].completed;
    if (status) {
      if (date > new Date()) {
        let newDate = `${new Date().toLocaleString("default", {
          month: "short",
        })} ${date.getFullYear()}`;
        setDate(newDate, index);
      }
    } else {
      if (date < new Date()) {
        let newDate = `${new Date().toLocaleString("default", {
          month: "short",
        })} ${date.getFullYear()}`;
        setDate(newDate, index);
      }
    }
  };

  const setIncomplete = (index) => {
    dateValidation(index);
    dispatch({
      type: SET_INCOMPLETE,
      payload: index,
    });
    // createRoadmapStep(index);
  };

  const setStepID = (data, index) => {
    dispatch({
      type: SET_TYPE,
      payload: [data, index],
    });
    // createRoadmapStep(index);
  };

  const setDescription = (data, index) => {
    dispatch({
      type: SET_DESCRIPTION,
      payload: [data, index],
    });
    // createRoadmapStep(index);
  };

  const setLink = (data, index) => {
    dispatch({
      type: SET_LINK,
      payload: [data, index],
    });
  };

  const setID = (data, index) => {
    dispatch({
      type: SET_ID,
      payload: [data, index],
    });
  };

  const setDate = (data, index) => {
    dispatch({
      type: SET_DATE,
      payload: [data, index],
    });
    // createRoadmapStep(index);
  };


  const submit = () => {
    /*
    Creates a roadmap
    */

    let obj = {};
    let counter = 0;

    if (roadmapTitle != false && roadmapTitle.trim().length > 3) {
      obj["title"] = roadmapTitle.trim();
    } else {
      obj["title"] = `From ${state.data[0].name} to ${
        state.data[state.data.length - 1].name
      } `;
    }

    obj["description"] = "";

    obj["owner"] = parseInt(localStorage.getItem("userId"));
    obj["creator"] = parseInt(localStorage.getItem("userId"));

    let list = [];

    state.data.map((x, i) => {
      if (state.data[i].new) {
        Post("roadmap/step", {
          step_type: parseInt(genericStepTypeID),
          title: state.data[i].name,
          link: url,
          user_id: parseInt(localStorage.getItem("userId")),
          cost: 0,
        }).then((e) => {
          setStepID(e.data.ID, i);
          state.data[i].stepCreated = true;

          let date = new Date("01 " + state.data[i].date);
          list = [
            ...list,
            {
              step: state.data[i].type,
              user: 1,
              completed: completed || state.data[i].completed,
              title: state.data[i].name,
              link: state.data[i].link,
              completed_date: date.toISOString(),
              description_1: state.data[i].description,
              position: state.data[i].position,
              is_start: i === 0 ? true : false,
              is_end: i === 1 ? true : false,
            },
          ];

          // if it's the last step, create the request
          counter++;
          if (counter == state.data.length) {
            // start and end for the roadmap
            obj["start"] = state.data[0].type;
            obj["end"] = state.data[state.data.length - 1].type;

            obj["cost"] = 0;
            obj["steps"] = list;
            obj["step_taken"] = state.data.length;
            obj["forked"] = false;
            obj["simplified"] = true;
            obj["draft"] = true;
            obj["incomplete"] = !completed;
            obj["private"] = roadmapPrivate;

            let dt1 = new Date("01 " + state.data[0].date);
            let dt2 = new Date("01 " + state.data[state.data.length - 1].date);
            let diff = (dt1 - dt2) / 1000;
            diff /= 60 * 60 * 24;
            obj["tags"] = [{ tag: tagRes }];
            obj["time_taken"] = Math.abs(Math.round(diff));

            Post("roadmap/create", obj).then((e) => {
              router.push(`/edit/${e.data.unique_link}`);
            });
          }
        });
      }

    });
  };

  const createStep = (order) => {
    /*
    Creates and updates step
    in association with RoadmapStep

    Step - Stores title.
    RoadmapStep - Stores Description and Position
    */

    setCalled(true);
    setTimeout(() => {
      if (state.data[order].new) {
        Post("roadmap/step", {
          step_type: parseInt(genericStepTypeID),
          title: state.data[order].name,
          link: url,
          user_id: parseInt(localStorage.getItem("userId")),
          cost: 0,
        }).then((e) => {
          state.data[order].stepCreated = true;
          setStepID(e.data.ID, order);
          createRoadmapStep(order);
        });
      } else {
        // for new, simplified roadmaps,
        // step-roadmapstep is 1-to-1
        Put("roadmap/step", {
          ID: state.data[order].type,
          step_type: parseInt(genericStepTypeID),
          title: state.data[order].name,
          link: url,
          user_id: parseInt(localStorage.getItem("userId")),
          cost: 0,
        }).then((e) => {
          createRoadmapStep(order);
        });
      }
    }, [1000]);
  };


  const createRoadmapStep = (order) => {
    if (!called && !newMode) {
      setTimeout(() => {
        if (
          state.data[order].name &&
          state.data[order].date &&
          state.data[order].type
        ) {
          if (state.data[order].new) {

            dispatch({
              type: SET_NEW,
              payload: order,
            });

            let date = new Date("01 " + state.data[order].date);

            Post("roadmap/roadmapstep", {
              step: state.data[order].type,
              user: parseInt(localStorage.getItem("userId")),
              roadmap: parseInt(roadmapID),
              completed: completed || state.data[order].completed,
              position: state.data[order].position,
              completed_date: date.toISOString(),
              description_1: state.data[order].description,
            }).then((e) => setID(e.data["ID"], order));
          } else {
            let date = new Date("01 " + state.data[order].date);
            Put("roadmap/roadmapstep", {
              step: state.data[order].type,
              user: parseInt(localStorage.getItem("userId")),
              ID: state.data[order].ID,
              completed: completed || state.data[order].completed,
              position: state.data[order].position,
              completed_date: date.toISOString(),
              description_1: state.data[order].description,
            });

            if (order === 0 || order === state.data.length - 1) {
              let dt1 = new Date(state.data[0].date);
              let dt2 = new Date(state.data[state.data.length - 1].date);
              let diff = (dt1 - dt2) / 1000;
              diff /= 60 * 60 * 24;
              Put("roadmap/update", {
                ID: parseInt(roadmapID),
                end: state.data[state.data.length - 1].type,
                start: state.data[0].type,
                time_taken: Math.abs(Math.round(diff)),
              });
            }

          }
        }
        setCalled(false);
      }, [1000]);
    }
  };


  const resetState = () => {
    setCompleted(true);
    dispatch({
      type: SET_DEFAULT,
      payload: [
        [
          {
            completed: true,
            date: `${new Date().toLocaleString("default", {
              month: "short",
            })} ${new Date().getFullYear()}`,
            name: "",
            type: "",
            link: "",
            position: 0,
            description: "",
            new: false,
          },
        ],
      ],
    });
  };

  const createDefault = (id) => {
    resetState();
    Get(`roadmap/get/${id}`).then((e) => {
      if (e.status === 200) {
        let tempData = Lodash.sortBy(e.data.steps, ["position"]);

        if (e.data.incomplete) {
          setCompleted(false);
        }

        if (e.data.private) {
          setRoadmapPrivate(true);
        }

        setSimplified(e.data.simplified);

        dispatch({
          type: SET_DEFAULT,
          payload: [tempData],
        });
      }
    });
  };

  return (
    <CreateContext.Provider
      value={{
        completed,
        setCompleted,
        ...state,
        removeMap,
        saveMap,
        setName,
        setLink,
        setDescription,
        setStepID,
        setDate,
        submit,
        createRoadmapStep,
        createStep,
        setTagRes,
        createDefault,
        tagRes,
        setRoadmapID,
        setNewMode,
        setIncomplete,
        resetState,
        roadmapPrivate,
        setRoadmapPrivate,
        called,
        stepsForDropdown,
        setStepsForDropdown,
        stepTypesForDropdown,
        setStepTypesForDropdown,
        setRoadmapTitle,
      }}
    >
      {props.children}
    </CreateContext.Provider>
  );
};

export default CreateState;
