import EthStore from './eth-store';

export interface EthStores {
  ethStore: EthStore;
}

const ethStore = new EthStore();

const ehtStores = {
  ethStore,
};

const useEthStores = (): EthStores => ehtStores;
export default useEthStores;
