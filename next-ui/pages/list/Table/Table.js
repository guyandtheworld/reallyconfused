import React from "react";
import { Row, Table, Col, Container, Dropdown } from "react-bootstrap";
import Router from "next/router";

const TableContainer = ({
  data,
  langFilter,
  langFilterList,
  setLangFilter,
  setJobFilter,
  jobFilter,
  jobFilterList,
  my,
  error,
}) => {
  const click = (num) => {
    Router.push(`/roadmap/${num}`);
  };

  return (
    <div
      className={"box pt-3 pr-3 pt-3 pl-3 mb-5"}
      style={{ minHeight: "88vh" }}
    >
      <Row>
        <h4 className={"m-2 p-1 pl-2 mb-4 mr-auto"}>{my && "My "}Roadmaps</h4>
        {langFilterList && !!Object.keys(langFilterList).length && (
          <Dropdown className={"mt-2"} onSelect={(e) => setLangFilter(e)}>
            <Dropdown.Toggle variant="outline" id="dropdown-basic">
              <span className={"mr-1"} aria-label={"laptop"} role={"img"}>
                💻
              </span>
              {langFilter ? langFilterList[langFilter] : "All Languages"}
            </Dropdown.Toggle>
            <Dropdown.Menu alignRight>
              <Dropdown.Item eventKey={0}>All Languages</Dropdown.Item>
              {langFilterList &&
                Object.keys(langFilterList).map((x) => {
                  return (
                    <Dropdown.Item key={x} eventKey={x}>
                      {langFilterList[x]}
                    </Dropdown.Item>
                  );
                })}
            </Dropdown.Menu>
          </Dropdown>
        )}
        {jobFilterList && !!Object.keys(jobFilterList).length && (
          <Dropdown className={"mt-2 mr-2"} onSelect={(e) => setJobFilter(e)}>
            <Dropdown.Toggle variant="outline" id="dropdown-basic">
              <span className={"mr-1"} aria-label={"brief-case"} role={"img"}>
                💼
              </span>
              {jobFilter ? jobFilterList[jobFilter] : "All Day-Jobs"}
            </Dropdown.Toggle>

            <Dropdown.Menu alignRight>
              <Dropdown.Item eventKey={0}>All Day-Jobs</Dropdown.Item>
              {jobFilterList &&
                Object.keys(jobFilterList).map((x) => {
                  return (
                    <Dropdown.Item key={x} eventKey={x}>
                      {jobFilterList[x]}
                    </Dropdown.Item>
                  );
                })}
            </Dropdown.Menu>
          </Dropdown>
        )}
      </Row>
      <Table responsive="sm">
        <thead>
          <tr>
            <th>
              <span className={"mr-1"} aria-label={"brief-case"} role={"img"}>
                💼
              </span>
              Career
            </th>
            <th>
              <span className={"mr-1"} aria-label={"laptop"} role={"img"}>
                🏁
              </span>
              Start
            </th>
            <th>
              <span className={"mr-1"} aria-label={"time"} role={"img"}>
                ⌛
              </span>
              Time Taken
            </th>
            {/* <th>
              {" "}
              <span className={"mr-1"} aria-label={"study"} role={"img"}>
                📚
              </span>
              Type Of Study
            </th>
            <th>
              <span className={"mr-1"} aria-label={"money"} role={"img"}>
                💰
              </span>
              Amount Spent
            </th> */}
            <th>
              <span className={"mr-1"} aria-label={"name"} role={"img"}>
                ⭐
              </span>
              Stars
            </th>
            <th>
              <span className={"mr-1"} aria-label={"name"} role={"img"}>
                😁
              </span>
              Name
            </th>
          </tr>
        </thead>

        <tbody>
          {data?.length
            ? data.map((data) => (
                <tr
                  onClick={() => click(data.unique_link)}
                  className={"hover"}
                  key={data}
                >
                  <td>{data.end}</td>
                  <td>{data.start}</td>
                  <td>{data.time_taken} days</td>
                  {/* <td>Self Study</td>
                  <td>{data.cost}$ spent </td> */}
                  <td>{data.stars || 0}</td>
                  <td>{data.creator_name}</td>
                </tr>
              ))
            : null}
        </tbody>
      </Table>
      {data?.length ? null : error ? (
        <div className={"empty-message"}>Sorry, no roadmaps found.</div>
      ) : (
        <div className="loader"></div>
      )}
    </div>
  );
};

export default TableContainer;
