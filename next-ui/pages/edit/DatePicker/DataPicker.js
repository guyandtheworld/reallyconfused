import React, { useState, useContext } from "react";
import styles from "./DatePicker.module.scss";
import { Col, Row, Button } from "react-bootstrap";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { AiOutlineCalendar } from "react-icons/ai";
import OutsideClickHandler from "react-outside-click-handler";
import CreateContext from "../../../Context/CreateContext/CreateContext";

const DatePicker = ({ order, onChange }) => {
  const { data, setDate, completed } = useContext(CreateContext);
  const [year, setYear] = useState(2021);
  const [open, setOpen] = useState(false);

  const checkDisabled = (date) => {
    let chosenDate = new Date(`${date} ${year}`);
    let today = new Date();
    let stepCompleted = data[order].completed;
    let disabled = false;

    // if (completed && today < chosenDate) {
    //   disabled = true;
    // }

    // if (stepCompleted && today < chosenDate) {
    //   disabled = true;
    // }

    // if (!completed && !stepCompleted && today > chosenDate) {
    //   disabled = true;
    // }

    // if (order !== 0 && new Date(data[order - 1].date) > chosenDate) {
    //   disabled = true;
    // }

    // if (data[order + 1]?.date && new Date(data[order + 1].date) < chosenDate) {
    //   disabled = true;
    // }

    return disabled;
  };

  return (
    <>
      <Button
        variant={"outline-primary"}
        onClick={() => {
          setOpen(!open);
          onChange();
        }}
        className={styles.datePick}
      >
        {data[order]?.date}
        <div className={styles.miniBox}>
          <AiOutlineCalendar className={"mt-auto mb-auto"} />
        </div>
      </Button>
      {open && (
        <OutsideClickHandler
          onOutsideClick={() => {
            setOpen(!open);
          }}
        >
          <Col className={styles.datepicker}>
            <Row>
              <Button
                variant={""}
                className={`${styles.dateArrowBox} p-0`}
                onClick={() => setYear(year - 5)}
                xs={2}
              >
                <IoIosArrowBack style={{ left: 0 }} size={20} />
                <IoIosArrowBack style={{ marginLeft: -26 }} size={20} />
              </Button>
              <Button
                variant={""}
                className={`${styles.dateArrowBox} `}
                onClick={() => setYear(year - 1)}
                xs={2}
              >
                <IoIosArrowBack style={{ left: 0 }} size={20} />
              </Button>
              <Col className={styles.dateYear}>{year}</Col>
              <Button
                variant={""}
                className={`${styles.dateArrowBox} p-0`}
                onClick={() => setYear(year + 1)}
                xs={2}
              >
                <IoIosArrowForward style={{ left: 0 }} size={20} />
              </Button>
              <Button
                variant={""}
                onClick={() => setYear(year + 5)}
                className={`${styles.dateArrowBox} p-0`}
                xs={2}
              >
                <IoIosArrowForward style={{ left: 0 }} size={20} />
                <IoIosArrowForward style={{ marginLeft: -26 }} size={20} />
              </Button>
            </Row>
            <Row>
              <Button
                variant={""}
                onClick={() => setDate(`Jan ${year}`, order)}
                disabled={checkDisabled("Jan")}
                className={styles.dateBox}
              >
                Jan
              </Button>
              <Button
                variant={""}
                onClick={() => setDate(`Feb ${year}`, order)}
                disabled={checkDisabled("Feb")}
                className={styles.dateBox}
              >
                Feb
              </Button>
              <Button
                variant={""}
                onClick={() => setDate(`Mar ${year}`, order)}
                disabled={checkDisabled("Mar")}
                className={styles.dateBox}
              >
                Mar
              </Button>
            </Row>
            <Row>
              <Button
                variant={""}
                disabled={checkDisabled("Apr")}
                onClick={() => setDate(`Apr ${year}`, order)}
                className={styles.dateBox}
              >
                Apr
              </Button>
              <Button
                variant={""}
                disabled={checkDisabled("May")}
                onClick={() => setDate(`May ${year}`, order)}
                className={styles.dateBox}
              >
                May
              </Button>
              <Button
                variant={""}
                disabled={checkDisabled("Jun")}
                onClick={() => setDate(`Jun ${year}`, order)}
                className={styles.dateBox}
              >
                Jun
              </Button>
            </Row>
            <Row>
              <Button
                variant={""}
                disabled={checkDisabled("Jul")}
                onClick={() => setDate(`Jul ${year}`, order)}
                className={styles.dateBox}
              >
                Jul
              </Button>
              <Button
                variant={""}
                disabled={checkDisabled("Aug")}
                onClick={() => setDate(`Aug ${year}`, order)}
                className={styles.dateBox}
              >
                Aug
              </Button>
              <Button
                variant={""}
                disabled={checkDisabled("Sep")}
                onClick={() => setDate(`Sep ${year}`, order)}
                className={styles.dateBox}
              >
                Sep
              </Button>
            </Row>
            <Row>
              <Button
                variant={""}
                disabled={checkDisabled("Oct")}
                onClick={() => setDate(`Oct ${year}`, order)}
                className={styles.dateBox}
              >
                Oct
              </Button>
              <Button
                variant={""}
                disabled={checkDisabled("Nov")}
                onClick={() => setDate(`Nov ${year}`, order)}
                className={styles.dateBox}
              >
                Nov
              </Button>
              <Button
                variant={""}
                disabled={checkDisabled("Dec")}
                onClick={() => setDate(`Dec ${year}`, order)}
                className={styles.dateBox}
              >
                Dec
              </Button>
            </Row>
          </Col>
        </OutsideClickHandler>
      )}
    </>
  );
};

export default DatePicker;
