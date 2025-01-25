import { PrivateKey, PublicKey, Mina, Field } from 'o1js';
import { CreditScoringApp } from './Add';

const Local = await Mina.LocalBlockchain();
Mina.setActiveInstance(Local);

const deployerAccount = PrivateKey.random();  // Generate a random PrivateKey for deployer
const deployerKey = deployerAccount;  // Use deployer's PrivateKey

const feePayerPublicKey = deployerAccount.toPublicKey();
const feePayerSpec = feePayerPublicKey;

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

const creditScoringApp = new CreditScoringApp(zkAppAddress);

async function deploy() {
  console.log('Deploying Credit Scoring zkApp...');

  const tx = await Mina.transaction(feePayerSpec, async () => {
    creditScoringApp.deploy();
  });
  await tx.sign([deployerKey]).send();
  console.log('Deployment Complete!');
}

deploy();
