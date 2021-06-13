import axios from "axios";
import { makeAutoObservable } from "mobx";

import { OperationState } from "../../enums/operation-state";

interface allItemsParams {
  size: number;
  continuation?: string;
}

export default class MarketStore {
  constructor() {
    makeAutoObservable(this);
  }

  itemsState = OperationState.None;
  items: any = [];
  itemsContinuation!: string;

  getSellOrders = async (addItems?: boolean): Promise<void> => {
    try {
      this.itemsState = OperationState.Pending;

      const size = 30;
      const params: allItemsParams = {
        size,
      };

      if (addItems) {
        params.continuation = this.itemsContinuation;
      }

      const res = await axios(
        "https://api-staging.rarible.com/protocol/v0.1/ethereum/order/orders/sell",
        { params }
      );

      if (res.data) {
        const items = res.data.orders.filter(
          (item: any) =>
            item.make.assetType.assetClass === "ERC721_LAZY" ||
            item.make.assetType.assetClass === "ERC721" ||
            item.make.assetType.assetClass === "ERC1155_LAZY" ||
            item.make.assetType.assetClass === "ERC1155"
        );

        const newItems: any[] = [];
        items.forEach((item: any) => {
          if (
            newItems.find(
              (newItem) =>
                item.make.assetType.contract ===
                  newItem.make.assetType.contract &&
                item.make.assetType.tokenId === newItem.make.assetType.tokenId
            )
          ) {
            return;
          } else {
            newItems.push(item);
          }
        });

        const promises = newItems.map(async (item: any) => {
          const meta = await this.getItemMetaById(
            `${item.make.assetType.contract}:${item.make.assetType.tokenId}`
          );

          return {
            meta,
            item,
          };
        });
        let itemsWithMeta = await Promise.all(promises);

        if (addItems) {
          this.items = [...this.items, ...itemsWithMeta];
        } else {
          this.items = itemsWithMeta;
        }

        this.itemsContinuation = res.data.continuation;
        this.itemsState = OperationState.Success;
      }
    } catch (error) {
      this.itemsState = OperationState.Error;
    }
  };

  getItemMetaById = async (itemId: string) => {
    try {
      const res = await axios(
        `https://api-staging.rarible.com/protocol/v0.1/ethereum/nft/items/${itemId}/meta`
      );
      return res.data;
    } catch (error) {}
  };

  getBidsByItem = async (contract: string, tokenId: string) => {
    try {
      const res = await axios(
        `https://api-staging.rarible.com/protocol/v0.1/ethereum/order/orders/bids/byItem`,
        { params: { contract, tokenId, size: 100 } }
      );
      return res.data;
    } catch (error) {}
  };
}
