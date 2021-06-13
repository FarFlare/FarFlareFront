import React from "react";
import { AppBar, Toolbar, Link, Typography, Grid } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import useEthStores from "../../stores/eth/index";

const useStyles = makeStyles((theme) => ({
  link: {
    color: "white",
    margin: theme.spacing(1, 1.5),
  },
  balance: {
    marginLeft: "auto",
    fontWeight: 600,
  },
  iconConrainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 22,
    width: 22,
    marginLeft: 10,
    borderRadius: "50%",
    border: "1px solid rgb(229, 232, 235)",
  },
  icon: {
    height: 14,
    width: 14,
  },
}));

const menuItems = [
  {
    path: "/market",
    label: "Marketplace",
  },
];

const Navbar = () => {
  const classes = useStyles();
  const { push } = useHistory();

  const { ethStore } = useEthStores();

  return (
    <AppBar position="relative">
      <Toolbar>
        <nav>
          {menuItems.map((item) => (
            <Link
              variant="button"
              className={classes.link}
              onClick={() => push(item.path)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Grid container direction="row">
          <Typography className={classes.balance}>
            {ethStore.balanceNumber}
          </Typography>
          <div className={classes.iconConrainer}>
            <img
              src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg"
              alt="eth"
              className={classes.icon}
            />
          </div>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
