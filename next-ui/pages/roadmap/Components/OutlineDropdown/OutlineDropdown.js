import { Dropdown } from "react-bootstrap";
import styles from "./OutlineDropdwon.module.scss";
import { AiFillCaretDown } from "react-icons/ai";

const OutlineButton = ({ children, name }) => {
  return (
    <>
      <Dropdown menuAlign="right" className={"outline-dropdown"}>
        <Dropdown.Toggle className={styles.toggle} variant="outline-primary">
          {name}
          <div className={styles.miniBox}>
            <AiFillCaretDown className={"mt-auto mb-auto"} />
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu alignRight={true}>{children}</Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default OutlineButton;
