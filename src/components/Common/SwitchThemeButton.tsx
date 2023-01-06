import { ReactNode, useState } from "react";
import cx from "classnames";
import "./Button.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun, faWallet } from "@fortawesome/free-solid-svg-icons";

type Props = {
  children?: ReactNode;
  onClick: () => void;
  className?: string;
  small?: boolean;
  isDarkTheme?: boolean;
};

export default function SwitchThemeButton({ children, onClick, className, small, isDarkTheme }: Props) {
  const classNames = cx("btn btn-primary btn-switch connect-wallet", className);
  if (small) {
    return (
      <div className={classNames} onClick={onClick}>
        {isDarkTheme ? <FontAwesomeIcon icon={faMoon} /> : <FontAwesomeIcon icon={faSun} />}
      </div>
    );
  }
  return (
    <div className={classNames} style={{ cursor: "auto" }}>
      <FontAwesomeIcon icon={faSun} />
      {children}
    </div>
  );
}
