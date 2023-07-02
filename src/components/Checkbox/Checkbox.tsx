import React, { PropsWithChildren, useCallback } from "react";

import cx from "classnames";

import "./Checkbox.css";
import { AiFillCheckCircle, AiOutlineCheckCircle } from "react-icons/ai";
type Props = {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  disabled: boolean;
  className: string;
  inactiveColor: string;
  activeColor: string;
};
export default function Checkbox(props: PropsWithChildren<Props>) {
  const { isChecked, setIsChecked, disabled, className, inactiveColor, activeColor } = props;

  const handleClick = useCallback(() => setIsChecked(!isChecked), [isChecked, setIsChecked]);

  return (
    <div className={cx("Checkbox", { disabled, selected: isChecked }, className)} onClick={handleClick}>
      <span className="Checkbox-icon-wrapper">
        {isChecked && <AiFillCheckCircle color={activeColor} className="App-icon Checkbox-icon active" size={20} />}
        {!isChecked && (
          <AiOutlineCheckCircle color={inactiveColor} className="App-icon Checkbox-icon inactive" size={20} />
        )}
      </span>
      <span className="Checkbox-label">{props.children}</span>
    </div>
  );
}
