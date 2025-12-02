import React from "react";
export const renderOptions = (
  label_key,
  value_key,
  data,
  placeholder,
  clickableValue,
  onClick
) => {
  const result = [{ value: "", label: `Select ${placeholder}` }];
  data.map((item) => {
    const option = {
      name: item[`${label_key}`],
      value: item[`${value_key}`],
      label : (
        <div className="d-flex justify-content-between">
          <div>{item[`${label_key}`]}</div>
          <div
            className={`${clickableValue}`}
            onClick={() => {
              onClick(item[`${label_key}`]);
            }}
          ></div>
        </div>
      )
    };
    // if (item[`${value_key}`] >= 10000) {
    //   option.label = (
    //     <div className="d-flex justify-content-between">
    //       <div>{item[`${label_key}`]}</div>
    //       <div
    //         className={`${clickableValue}`}
    //         onClick={() => {
    //           onClick(item[`${label_key}`]);
    //         }}
    //       ></div>
    //     </div>
    //   );
    // } else {
    //   option.label = item[`${label_key}`];
    // }
    result.push(option);
    return item;
  });
  return result;
};
