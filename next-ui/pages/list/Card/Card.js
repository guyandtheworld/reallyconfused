import React, { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import styles from "./Card.module.scss";
import { BiTimeFive } from "react-icons/bi";
import { MdAttachMoney } from "react-icons/md";
import Router from "next/router";
import { BsBook } from "react-icons/bs";

const Card = ({ data }) => {
  const click = (num) => {
    Router.push({
      pathname: `/roadmap/${num}`,
    });
  };

  return (
    <>
      <Col className={`m-0 mb-3 mt-3 p-0 ${styles.card}`}>
        <Col
          onClick={() => click(data?.unique_link)}
          className={"d-flex pt-3 pb-3 box hover"}
        >
          <Col className={" m-0 p-0"}>
            <h5 className={"mb-1"}>{data?.end}</h5>
            <div className={styles.name}>- {data?.creator_name} </div>
            <div className={`${styles.language} mt-2`}>
              Beginning- <br />{" "}
              <span className={styles.languages}>{data?.start}</span>
            </div>
          </Col>
          <div className={" d-flex flex-column align-items-end m-0 p-0"}>
            <div className={styles.pill}>
              {/* <span className={styles.timeIcon}>
                <BiTimeFive style={{ marginBottom: "0.2rem" }} size={16} />
              </span> */}
              <span className={"ml-1"} aria-label={"time"} role={"img"}>
                ⌛
              </span>
              <span className={styles.pillName}>{data?.time_taken} days</span>
            </div>
            <div className={styles.pill}>
              <span className={"ml-1"} aria-label={"study"} role={"img"}>
                ⭐
              </span>
              <span className={styles.pillName}>
                {data?.stars || 0} star{`${!data?.stars || data?.stars === 1 ? "" : "s"}`}
              </span>
            </div>
            {/* <div className={styles.pill}>
              <span className={styles.bookIcon}>
                <BsBook style={{ marginBottom: "0.175rem" }} size={12} />
              </span>
              <span className={"ml-1"} aria-label={"study"} role={"img"}>
                📚
              </span>
              <span className={styles.pillName}>Self Learning</span>
            </div>
            <div className={styles.pill}>
              <span className={styles.moneyIcon}>
                <MdAttachMoney style={{ marginBottom: "0.175rem" }} size={16} />
              </span>
              <span className={"ml-1"} aria-label={"money"} role={"img"}>
                💰
              </span>
              <span className={styles.pillName}>${data?.cost} spent</span>
            </div> */}
          </div>
        </Col>
      </Col>
    </>
  );
};

export default Card;
