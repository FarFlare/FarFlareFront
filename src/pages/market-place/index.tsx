import React, { useEffect } from "react";
import { Grid, Container, CircularProgress, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InfiniteScroll from "react-infinite-scroll-component";
import { observer } from "mobx-react";
import { get } from "lodash";

import Layout from "../../components/layout";
import MarketItem from "../../components/market-item";
import useMarketStores from "../../stores/market/index";

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(8),
  },
  fc: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing(4),
  },
  scroller: {
    overflow: "hidden !important",
  },
  button: {
    marginBottom: theme.spacing(1.5),
  },
}));

const MarketPlacePage = () => {
  const classes = useStyles();
  const { marketStore } = useMarketStores();

  useEffect(() => {
    marketStore.getSellOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <Layout>
      <Container className={classes.cardGrid} maxWidth="md">
        <Button variant="outlined" color="primary" className={classes.button}>
          Фильтры
        </Button>
        <InfiniteScroll
          className={classes.scroller}
          next={() => marketStore.getSellOrders(true)}
          hasMore={true}
          loader={
            <div className={classes.fc}>
              <CircularProgress />
            </div>
          }
          dataLength={marketStore.items.length}
        >
          <Grid container spacing={4}>
            {marketStore.items.map((item: any) => (
              <MarketItem
                key={get(item, "item.id")}
                name={get(item, "meta.name")}
                url={get(item, "meta.image.url.PREVIEW")}
                price={get(item, "item.take.value")}
                bid={item.bid}
                address={get(item, "item.make.assetType.contract")}
                tokenId={get(item, "item.make.assetType.tokenId")}
              />
            ))}
          </Grid>
        </InfiniteScroll>
      </Container>
    </Layout>
  );
};

export default observer(MarketPlacePage);
