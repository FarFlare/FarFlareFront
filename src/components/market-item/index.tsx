import React, { FC, useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Slider,
  TextField,
  Popper,
  Fade,
  Paper,
  Snackbar,
  CircularProgress,
  Popover,
  Link,
} from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import { CheckCircle, InfoOutlined } from "@material-ui/icons";
import { toNumber } from "lodash";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import { observer } from "mobx-react";

import useEthStores from "../../stores/eth/index";
import logo from "../../logo.svg";

import ShardToken from "../../abi/ShardToken.json";

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "56.25%", // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  name: {
    fontSize: theme.spacing(2),
    fontWeight: 600,
  },
  popperPaper: {
    padding: theme.spacing(2),
  },
  popper: {
    zIndex: 10000,
  },
  price: {
    fontWeight: 600,
    fontSize: theme.spacing(2),
    marginBottom: theme.spacing(1.2),
  },
  input: {
    marginBottom: theme.spacing(1),
    width: "100%",
  },
  iconConrainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 22,
    width: 22,
    marginRight: 5,
    borderRadius: "50%",
    border: "1px solid rgb(229, 232, 235)",
  },
  icon: {
    height: 14,
    width: 14,
  },
  mb: {
    marginBottom: theme.spacing(1.2),
  },
  infoIcons: {
    marginBottom: theme.spacing(1.5),
    cursor: "pointer",
  },
  info: {
    padding: theme.spacing(2),
  },
}));

const valuetext = (value: number) => {
  return `${value}°C`;
};

function decimalAdjust(type: "round" | "floor", value: any, exp: any) {
  // Если степень не определена, либо равна нулю...
  if (typeof exp === "undefined" || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  // Если значение не является числом, либо степень не является целым числом...
  if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
    return NaN;
  }
  // Сдвиг разрядов
  value = value.toString().split("e");
  value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)));
  // Обратный сдвиг
  value = value.toString().split("e");
  return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp));
}

export interface Props {
  name: string;
  url: string;
  price: string;
  bid: any;
  address: string;
  tokenId: string;
}

const MarketItem: FC<Props> = ({ name, url, price, bid, address, tokenId }) => {
  const classes = useStyles();

  const [popperVisible, setPopperVisible] = useState(false);
  const [popperEl, setPopperEl] = useState<HTMLSpanElement | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [sliderValue, setSliderValue] = useState(0);
  const [inputError, setInputError] = useState(false);
  const [locked, setLocked] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [allocation, setAllocation] = useState<any>(null);
  const [infoPopoverVisible, setInfoPopoverVisible] = useState(false);
  const [infoPopEl, setInfoPopEl] = useState<HTMLSpanElement | null>(null);
  const [isBuyed, setIsBuyed] = useState(false);
  const [shard, setShard] = useState("");
  const [shardBalance, setShardBalance] = useState(0);

  const onMouseOver = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    setPopperEl(e.currentTarget);
    setPopperVisible(true);
  };

  const onMouseOut = () => {
    setPopperVisible(false);
  };

  const onInfoMouseOver = (
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>
  ) => {
    setInfoPopEl(e.currentTarget);
    setInfoPopoverVisible(true);
  };

  const { ethStore } = useEthStores();

  const changedPrice = toNumber(price) / Math.pow(10, 18);

  useEffect(() => {
    const getBalance = async (shardToken: any) => {
      const balance = await shardToken.methods
        .balanceOf(ethStore.address)
        .call();
      setShardBalance(balance);
      console.log(balance, "balance");
    };

    if (shard) {
      const abi = ShardToken.abi;
      // @ts-ignore
      const shardToken = new window.web3.eth.Contract(abi, shard);
      if (shardToken) {
        getBalance(shardToken);
      }
    }
  }, [shard]);

  const getShard = async () => {
    try {
      const res = await ethStore.token.methods.shards(address, tokenId).call();
      if (res !== "0x0000000000000000000000000000000000000000") {
        setIsBuyed(true);
        setShard(res);
      }
    } catch (error) {}
  };

  useEffect(() => {
    setInputError(
      isNaN(toNumber(inputValue)) ||
        toNumber(inputValue) > changedPrice - toNumber(locked) ||
        toNumber(inputValue) > ethStore.balanceNumber
    );
  }, [inputValue, ethStore.balanceNumber, locked, changedPrice]);

  const getTotalLocked = async () => {
    try {
      const locked = window.web3.utils.fromWei(
        (
          await ethStore.token.methods.totalLockedFor(address, tokenId).call()
        ).toString()
      );
      setLocked(locked);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllocation = async () => {
    try {
      const res = await ethStore.token.methods
        .getAllocation(address, tokenId)
        .call({ from: ethStore.address });
      setAllocation(res);
    } catch (error) {}
  };

  useEffect(() => {
    getTotalLocked();
    getAllocation();
    getShard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, tokenId]);

  const renderName = () => {
    if (name.length > 10) {
      return (
        <Typography
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
        >{`${name.substr(0, 6).trim()}...`}</Typography>
      );
    } else {
      return <Typography>{name}</Typography>;
    }
  };

  const onSliderChange = (event: object, value: number | number[]): void => {
    if (typeof value === "number") {
      setInputValue(`${(changedPrice / 100) * value}`);
      setSliderValue(value);
    }
  };

  const onInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setInputValue(event.target.value);
    const expense = toNumber(event.target.value);
    if (expense <= ethStore.balanceNumber) {
      setSliderValue(
        decimalAdjust("round", (expense / changedPrice) * 100, -2)
      );
    }
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      const hash = await ethStore.token.methods
        .allocate(address, tokenId, price)
        .send({
          from: ethStore.address,
          value: window.web3.utils.toWei(inputValue, "ether"),
        });

      await window.web3.eth.getTransaction(
        hash.transactionHash,
        (error, trans) => {
          setLoading(false);
          setTransactionStatus("success");
          setAlertVisible(true);
          getTotalLocked();
          getAllocation();
          getShard();
        }
      );
    } catch (error) {
      setLoading(false);
      setTransactionStatus("error");
      setAlertVisible(true);
      console.log(error);
    }
  };

  const popId = infoPopoverVisible ? "simple-popover" : undefined;

  const max = decimalAdjust(
    "round",
    ((changedPrice - toNumber(locked)) / changedPrice) * 100,
    -2
  );

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Popper
        open={popperVisible}
        anchorEl={popperEl}
        placement="bottom"
        transition
        className={classes.popper}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper className={classes.popperPaper}>{name}</Paper>
          </Fade>
        )}
      </Popper>
      <Card className={classes.card}>
        <CardMedia
          className={classes.cardMedia}
          image={url || logo}
          title="Image title"
        />
        <CardContent className={classes.cardContent}>
          <Grid container direction="row" justify="space-between">
            <Grid item>
              <Typography className={classes.name}>{renderName()}</Typography>
            </Grid>
            <Grid item>
              <Grid container direction="row">
                <div className={classes.iconConrainer}>
                  <img
                    src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg"
                    alt="eth"
                    className={classes.icon}
                  />
                </div>

                <Typography className={classes.price}>
                  {`${changedPrice} ETH`}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {!isBuyed && (
            <Grid container direction="row" justify="space-between">
              <Typography className={classes.mb}>Собрано:</Typography>
              <Typography className={classes.price}>{locked}</Typography>
            </Grid>
          )}
          {toNumber(locked) > 0 && allocation && allocation[0] !== "0" && (
            <span aria-describedby={popId} onClick={onInfoMouseOver}>
              <InfoOutlined className={classes.infoIcons} color="primary" />
            </span>
          )}
          {isBuyed && (
            <Grid container direction="row" justify="space-between">
              <Typography className={classes.mb}>
                <Link
                  href={`https://rinkeby.etherscan.io/token/${shard}`}
                  target="_blank"
                >
                  ShardToken
                </Link>
              </Typography>
              <Typography className={classes.price}>{toNumber(shardBalance) / Math.pow(10, 18)}</Typography>
            </Grid>
          )}
          {!isBuyed && ethStore.balanceNumber ? (
            <>
              <TextField
                label="ETH"
                variant="outlined"
                className={classes.input}
                size="small"
                value={inputValue}
                onChange={onInputChange}
                error={inputError}
              />
              <Grid container spacing={2}>
                <Grid item>0%</Grid>
                <Grid item xs>
                  <Slider
                    onChange={onSliderChange}
                    getAriaValueText={valuetext}
                    aria-labelledby="discrete-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    min={0}
                    max={max}
                    value={sliderValue}
                  />
                </Grid>
                <Grid item>{max}%</Grid>
              </Grid>
            </>
          ) : null}
        </CardContent>
        {ethStore.balanceNumber ? (
          <CardActions>
            {!isBuyed ? (
              <Button
                size="small"
                color="primary"
                disabled={inputError}
                onClick={onSubmit}
              >
                {loading ? <CircularProgress /> : "Вложить"}
              </Button>
            ) : (
              <CheckCircle style={{ color: green[500] }} />
            )}
          </CardActions>
        ) : null}
      </Card>
      <Snackbar
        open={alertVisible}
        autoHideDuration={6000}
        onClose={() => setAlertVisible(false)}
      >
        {transactionStatus === "success" ? (
          <Alert onClose={() => setAlertVisible(false)} severity="success">
            Транзакция прошла успешно
          </Alert>
        ) : (
          <Alert severity="error">Что-то пошло не так!</Alert>
        )}
      </Snackbar>
      <Popover
        id={popId}
        open={infoPopoverVisible}
        anchorEl={infoPopEl}
        onClose={() => setInfoPopoverVisible(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {allocation && allocation[0] !== "0" && (
          <Paper className={classes.info}>
            <Grid container direction="row" justify="space-between">
              <Typography className={classes.mb}>Вы внесли:</Typography>
              <Typography className={classes.price}>
                {allocation[0] / Math.pow(10, 18)}
              </Typography>
            </Grid>
            <Grid container direction="row" justify="space-between">
              <Typography className={classes.mb}>Вы владеете:</Typography>
              <Typography className={classes.price}>
                {(allocation[0] / toNumber(price)) * 100}%
              </Typography>
            </Grid>
          </Paper>
        )}
      </Popover>
    </Grid>
  );
};

export default observer(MarketItem);
