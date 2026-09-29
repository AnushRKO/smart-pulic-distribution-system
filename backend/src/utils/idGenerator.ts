const pad = (n: number, width: number) => String(n).padStart(width, '0');

let txnCounter = 1000;
let distCounter = 1000;

export const generateTransactionId = (): string => {
  const year = new Date().getFullYear();
  txnCounter++;
  return `TXN-${year}-${pad(txnCounter, 6)}`;
};

export const generateDistributionId = (): string => {
  const year = new Date().getFullYear();
  distCounter++;
  return `DIST-REC-${year}-${pad(distCounter, 6)}`;
};

export const generateBeneficiaryId = (seq: number): string => {
  const year = new Date().getFullYear();
  return `BEN-${year}-${pad(seq, 5)}`;
};

export const generateRationCardNumber = (seq: number): string => {
  const year = new Date().getFullYear();
  return `RC-${year}-${pad(seq, 6)}`;
};

export const generateShopId = (seq: number): string => {
  const year = new Date().getFullYear();
  return `SHOP-${year}-${pad(seq, 3)}`;
};

export const generateDistributorId = (seq: number): string => {
  const year = new Date().getFullYear();
  return `DIST-${year}-${pad(seq, 3)}`;
};
