import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { Modal } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles';

import { routes } from "./routes/index";
import useEthStores from './stores/eth/index';

import Phoenix from './abi/Phoenix.json';

const useStyles = makeStyles((theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
  }),
);

const TOKEN_ADDRESS = '0x536d17Ef0600696540A560ae15af180151a09FdC';

const App = () => {
  const classes = useStyles();

  const { ethStore } = useEthStores();

  const [modalVisible, setModalVisible] = useState(false);
  const [networkId, setNetworkId] = useState(0);

  useEffect(() => {
    const init = async () => {
      await loadWeb3();
      await loadBlockChain();
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBlockChain = async () => {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    const balance = await web3.eth.getBalance(accounts[0]);
    
    ethStore.setAdress(accounts[0]);
    ethStore.setBalance(balance);

    setNetworkId(networkId);

    if (networkId !== 4) {
      setModalVisible(true);
    }
    const abi = Phoenix.abi;
    // @ts-ignore
    if (abi) {
      // @ts-ignore
      const token = new web3.eth.Contract(abi, TOKEN_ADDRESS);
      console.log(token, 'tok')
      ethStore.setToken(token);
    }
  };

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      alert("error");
    }
  };

  const networkModalClose = () => {
    if (networkId === 4) {
      setModalVisible(false);
    }
  };

  return (
    <>
      <BrowserRouter>
        <Switch>
          {routes.map((item) => (
            <Route path={item.path} component={item.component} />
          ))}
          <Redirect to="/market" />
        </Switch>
        <Modal
          open={modalVisible}
          onClose={networkModalClose}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          className={classes.modal}
        >
          <div className={classes.paper}>
            <h2 id="transition-modal-title">Ошибка</h2>
            <p id="transition-modal-description">Переключите сеть.</p>
          </div>
        </Modal>
      </BrowserRouter>
    </>
  );
};

export default App;
