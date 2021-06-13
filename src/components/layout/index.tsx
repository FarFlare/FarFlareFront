import React, { FC, memo, ReactNode } from "react";
import { CssBaseline } from "@material-ui/core";

import Navbar from "../../components/navbar";
import Footer from '../footer/index';

interface Props {
  children?: ReactNode;
}

const MarketPlacePage: FC<Props> = (props) => {
  return (
    <>
      <CssBaseline />
      <Navbar />
      <main>{props.children}</main>
    </>
  );
};

export default memo(MarketPlacePage);
