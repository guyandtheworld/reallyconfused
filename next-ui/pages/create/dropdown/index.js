import React from "react";
import { Get, Post } from "../../../Utils/api";
import Select from "react-select";
import Creatable, { makeCreatableSelect } from "react-select/creatable";
import { Button } from "react-bootstrap";
import CreateContext from "../../../Context/CreateContext/CreateContext";

const DropdownComponent = ({
  defaultValue,
  url,
  valueName,
  keyName,
  onCreateNew,
  onChange,
  keyForState,
  keyForSetState,
  createUrl,
}) => {
  const context = React.useContext(CreateContext);

  // const [data, setData] = React.useState();

  const data = context[keyForState];
  const setData = context[keyForSetState];

  const [searchTerm, setSearchTerm] = React.useState("");
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (value === "" && defaultValue?.label.length) {
      setValue(defaultValue);
      load();
    } else {
      setValue("");
      load();
    }
  }, []);

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const ref = React.useRef();

  const load = () => {
    Get(url).then((e) => {
      let arr = [];
      e.data.map((x) => {
        arr.push({
          label: x[keyName],
          value: x[valueName],
        });
      });
      setData(arr);
    });
  };

  const customStyles = {
    control: (provided, state) => {
      // none of react-select's styles are passed to <Control />
      return {
        ...provided,
        border: state.isFocused ? "0px" : "0px",
        boxShadow: state.isFocused
          ? "0 0 0 0.2rem rgba(33, 150, 243, 0.25)"
          : "0px",
        backgroundColor: "#edeff2",
        borderRadius: "14px",
        paddingLeft: "4px",
      };
    },
    singleValue: (provided, state) => {
      const opacity = state.isDisabled ? 0.5 : 1;
      const transition = "opacity 300ms";

      return { ...provided, opacity, transition };
    },
  };

  const createNew = async (name) => {
    let newStep;
    if (createUrl) {
      newStep = await Post(createUrl, {
        name: name,
      });
    }
    setValue({ label: name, value: newStep.data.ID });
    onChange({ label: name, value: newStep.data.ID });
  };

  const createOption = (label) => ({
    label,
    value: label.toLowerCase().replace(/\W/g, ""),
  });

  return (
    <>
      <Creatable
        styles={customStyles}
        onInputChange={(e) => setSearchTerm(e)}
        ref={ref}
        inputValue={searchTerm}
        value={value}
        onCreateOption={(e) => {
          onCreateNew && onCreateNew(e);
          if (createUrl) {
            createNew(e);
            load();
          } else {
            let newValue = createOption(e);
            setValue(newValue);
            load();
          }
        }}
        options={data || []}
        onChange={(e) => {
          onChange(e);
          setValue(e);
          load();
        }}
        isSearchable={true}
        noOptionsMessage={() => "Not found"}
      />
    </>
  );
};

export default DropdownComponent;
