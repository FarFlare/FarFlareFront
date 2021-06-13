import MarketStore from './market-store';

export interface MarketStores {
  marketStore: MarketStore;
}

const marketStore = new MarketStore();

const marketStores = {
  marketStore,
};

const useMarketStores = (): MarketStores => marketStores;
export default useMarketStores;
