import React from "react";
import { Get, Put } from "../../../Utils/api";
import Router from "next/router";
import {
  ButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import CreateContext from "../../../Context/CreateContext/CreateContext";

const RoadmapSetting = ({ roadmap }) => {
  const {
    roadmapPrivate,
    completed,
    setCompleted,
    setRoadmapPrivate,
  } = React.useContext(CreateContext);

  const [ifPremium, setIfPremium] = React.useState(true);

  React.useEffect(() => {
    Get("user/profile").then((e) => {
      if (e.data.premium) {
        setIfPremium(true);
      }
    });
  }, []);

  const updateCompleted = () => {
    Put("roadmap/update", {
      ID: parseInt(roadmap),
      incomplete: !completed,
    });
  };

  const updatePrivate = () => {
    Put("roadmap/update", {
      ID: parseInt(roadmap),
      private: roadmapPrivate,
    });
  };

  return (
    <>
      <ButtonGroup
        name={"roadmapType"}
        className={"w-100 toggle-button"}
        toggle
      >
        <ToggleButton
          checked={completed}
          type="radio"
          variant="primary"
          onClick={() => {
            if (ifPremium) {
              setCompleted(true);
              updateCompleted();
            } else {
              Router.push("/premium");
            }
          }}
          name="radio"
        >
          Complete
        </ToggleButton>
        <ToggleButton
          checked={!completed}
          type="radio"
          onClick={() => {
            if (ifPremium) {
              setCompleted(false);
              updateCompleted();
            } else {
              Router.push("/premium");
            }
          }}
          variant="primary"
          name="radio"
        >
          Incomplete
        </ToggleButton>
      </ButtonGroup>
      <ButtonGroup
        name={"roadmapType"}
        className={"w-100 mr-2 mb-3 mt-3 toggle-button"}
        toggle
      >
        <ToggleButton
          checked={roadmapPrivate}
          type="radio"
          variant="primary"
          onClick={() => {
            if (ifPremium) {
              setRoadmapPrivate(true);
              updatePrivate();
            } else {
              Router.push("/premium");
            }
          }}
          name="radio"
        >
          Private
        </ToggleButton>
        <ToggleButton
          checked={!roadmapPrivate}
          type="radio"
          onClick={() => {
            if (ifPremium) {
              setRoadmapPrivate(false);
              updatePrivate();
            } else {
              Router.push("/premium");
            }
          }}
          variant="primary"
          name="radio"
        >
          Public
        </ToggleButton>
      </ButtonGroup>
    </>
  );
};

export default RoadmapSetting;
