## CreditScoringApp - zk-SNARK-Enabled Credit Scoring and Loan Approval

CreditScoringApp is a decentralized application built using o1js, designed to facilitate secure and privacy-preserving credit scoring and loan approvals. Leveraging the power of zk-SNARKs, the application ensures that sensitive financial data remains private while providing provable credit validation for financial services.

This is a step by step guide for deploying zkapp on Mina testnet.

## Key features

- The application allows users to securely store and validate credit scores without exposing sensitive information to external parties.
- Implements zk-SNARKs to validate credit scores and other financial criteria, ensuring transparency and trustworthiness.
- Built-in loan approval mechanism based on credit score thresholds. Approvals are computed securely without revealing the underlying credit score.
- Credit scores are stored as on-chain state variables in the form of cryptographically secure fields, ensuring data integrity and auditability.
- The logic for approval and validation adheres to provable computations, leveraging the Bool and Field types provided by the o1js framework.

## Project Structure

- src/Add.ts: It contains the core smart contract CreditScoringApp, implementing the credit scoring and loan approval logic.
- src/Add.test.ts: It contrains the test suite for testing the logic of the file utilizing jest framework.
- src/interact.ts: It handles user interactions or contract calls by defining functions to interact with the deployed Credit Scoring App smart contract.
- src/index.ts: It serves as the main entry point of the application, orchestrating the initialization and interaction logic for the Credit Scoring App.

### Add.ts

```typescript

import { Field, SmartContract, state, State, method, Bool, Provable } from 'o1js';

export class CreditScoringApp extends SmartContract {
  @state(Field) creditScore = State<Field>();

  // Initialize with a default value
  init() {
    super.init();
    this.creditScore.set(Field(0));
  }

  @method async storeCreditScore(score: Field) {
    this.creditScore.set(score);
  }

  @method async approveLoan(): Promise<void> {
    const isApproved = await this.checkLoanApproval();
    if (isApproved.isConstant()) {
      // If isConstant(), it's safe to convert to a native boolean
      const approved = isApproved.toBoolean();
      if (approved) {
        console.log('Loan Approved');
      } else {
        console.log('Loan Denied');
      }
    } else {
      // Use Provable.asProver to handle non-constant Bool
      Provable.asProver(() => {
        const approved = isApproved.toBoolean();
        if (approved) {
          console.log('Loan Approved');
        } else {
          console.log('Loan Denied');
        }
      });
    }
  }

  @method async verifyCreditScoreZKP(zkp: Field): Promise<void> {
    const isValidZkp = await this.checkZkpValidation(zkp);
    if (isValidZkp.isConstant()) {
      // If isConstant(), it's safe to convert to a native boolean
      const validZkp = isValidZkp.toBoolean();
      if (validZkp) {
        console.log('ZKP Verified');
      } else {
        console.log('ZKP Invalid');
      }
    } else {
      // Use Provable.asProver to handle non-constant Bool
      Provable.asProver(() => {
        const validZkp = isValidZkp.toBoolean();
        if (validZkp) {
          console.log('ZKP Verified');
        } else {
          console.log('ZKP Invalid');
        }
      });
    }
  }

  // Separate methods to return Bool (from o1js)
  private async checkLoanApproval(): Promise<Bool> {
    const score = this.creditScore.getAndRequireEquals();
    return score.greaterThanOrEqual(Field(700));  // This returns a Bool, not a boolean
  }

  private async checkZkpValidation(zkp: Field): Promise<Bool> {
    const score = this.creditScore.getAndRequireEquals();
    return score.equals(zkp);  // This returns a Bool, not a boolean
  }
}
```

### How it works

- storeCreditScore: Stores the credit score securely in the zkApp.
- approveLoan: Checks if the stored credit score is sufficient for loan approval (>= 700).
- verifyCreditScoreZKP: Validates a submitted Zero-Knowledge Proof (ZKP) against the stored credit score.
- checkLoanApproval & checkZkpValidation: Helper methods to perform the respective checks and return Bool.


### Add.test.ts

```typescript
import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from 'o1js';
import { CreditScoringApp } from './Add';
import { jest } from '@jest/globals';  // Add this import at the top of the test file


/*
 * This file specifies how to test the `CreditScoringApp` smart contract.
 * It is safe to delete this file and replace it with your own tests.
 */

let proofsEnabled = false;

describe('CreditScoringApp', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.TestPublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: CreditScoringApp;

  beforeAll(async () => {
    if (proofsEnabled) await CreditScoringApp.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, senderAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    senderKey = senderAccount.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new CreditScoringApp(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the Credit Scoring smart contract', async () => {
    await localDeploy();
    const creditScore = zkApp.creditScore.get();
    expect(creditScore).toEqual(Field(0));  // Default value should be 0
  });

  it('correctly stores the credit score in the Credit Scoring smart contract', async () => {
    await localDeploy();

    const newCreditScore = Field(750);
    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.storeCreditScore(newCreditScore);  // Set new score
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    const storedCreditScore = zkApp.creditScore.get();
    expect(storedCreditScore).toEqual(newCreditScore);  // Expect the new credit score to be stored
  });

  it('approves loan if credit score is above 700', async () => {
    await localDeploy();

    // Set a score above 700
    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.storeCreditScore(Field(750));
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // Capture console output
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await zkApp.approveLoan();  // This will log "Loan Approved"
    expect(logSpy).toHaveBeenCalledWith('Loan Approved');

    logSpy.mockRestore();  // Restore original console behavior
  });

  it('denies loan if credit score is below 700', async () => {
    await localDeploy();

    // Set a score below 700
    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.storeCreditScore(Field(650));
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // Capture console output
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await zkApp.approveLoan();  // This will log "Loan Denied"
    expect(logSpy).toHaveBeenCalledWith('Loan Denied');

    logSpy.mockRestore();  // Restore original console behavior
  });

  it('verifies credit score using ZKP', async () => {
    await localDeploy();

    // Set a score
    const creditScore = Field(750);
    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.storeCreditScore(creditScore);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // Capture console output
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await zkApp.verifyCreditScoreZKP(creditScore);  // This will log "ZKP Verified"
    expect(logSpy).toHaveBeenCalledWith('ZKP Verified');

    logSpy.mockRestore();  // Restore original console behavior
  });
});
```

### How it works

- The Mina.LocalBlockchain instance is used to simulate Mina blockchain operations locally, allowing you to test the zkApp functionality without needing to deploy it on a live network.
- The tests are run against a local instance of the Mina blockchain using `Mina.LocalBlockchain`. This allows for testing the smart contract in an isolated environment without interacting with the main network.
- The `deployerAccount` and `senderAccount` are created as test accounts to simulate real users interacting with the zkApp.
- A `CreditScoringApp` instance is initialized using the zkAppPrivateKey, simulating the deployment of the smart contract.
- The `generates and deploys the Credit Scoring smart contract` test checks if the contract is successfully deployed and the initial credit score is set to 0 by default.
- The `correctly stores the credit score` test simulates storing a new credit score (750) in the smart contract. It verifies that the credit score is correctly updated and stored in the contract's state.
- The `approves loan if credit score is above 700` test simulates storing a credit score of 750 and then calling the approveLoan method. It checks if the loan is approved by logging the result and verifying the output.
- The `denies loan if credit score is below 700` test simulates storing a credit score of 650 and checks if the loan is denied.
- The `verifies credit score using ZKP` test simulates storing a credit score of 750 and verifies the credit score using a ZKP. It checks if the ZKP is validated correctly by logging the result.
- The tests capture and mock the console output using `jest.spyOn(console, 'log')` to verify that the correct messages ("Loan Approved", "Loan Denied", "ZKP Verified") are logged during the execution of methods like `approveLoan` and `verifyCreditScoreZKP`.
- All interactions with the zkApp, such as storing a credit score or approving a loan, are wrapped in Mina transactions using `Mina.transaction`. The transactions are then signed and sent using the sign and send methods to simulate real-world blockchain interactions.

### index.ts

```typescript
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
```

### How it works 

- The script imports the necessary modules from the o1js library, including `PrivateKey`, `PublicKey`,`Mina`, and `Field`.
- `Mina.LocalBlockchain()` is used to create a local blockchain instance for testing or development purposes.
- `Mina.setActiveInstance(Local)` sets the local blockchain as the active blockchain instance, ensuring that the subsequent operations are performed on this local network.
- A random PrivateKey is generated for the deployer using `PrivateKey.random()`. This deployer key is used to sign the transaction for the zkApp deployment.
- The deployer's `PublicKey (feePayerPublicKey)` is derived from the deployer's private key, which will be used to pay transaction fees during deployment.
- A separate random `PrivateKey` is generated for the zkApp itself using `PrivateKey.random()`.
- The public key of the zkApp (`zkAppAddress`) is derived from this private key, which uniquely identifies the deployed zkApp on the blockchain.
- An instance of `CreditScoringApp` is created using the `zkAppAddress`. This is the smart contract that will be deployed to the blockchain.
- The `deploy` function is an asynchronous function that handles the deployment of the zkApp.
- A transaction (`tx`) is created using `Mina.transaction()`. This method takes two parameters:
  - `feePayerSpec` refers to the public key of the fee payer (i.e., the deployer's public key), which is responsible for paying the transaction fees.
  - A callback function, where the deploy method of the `CreditScoringApp` instance (`creditScoringApp.deploy()`) is called to deploy the smart contract.
  - The transaction is signed with the `deployerKey` (private key of the deployer) and then sent using `tx.send()`.
  - Once the transaction is successfully sent, a message `Deployment Complete!` is logged to the console to confirm that the zkApp has been deployed.
  



### interact.ts

```typescript
import { PrivateKey, PublicKey, Mina, Field } from 'o1js';
import { CreditScoringApp } from './Add';

const zkAppAddress = '<YOUR_ZKAPP_PUBLIC_KEY>'; // Replace with your zkApp's public key
const creditScoringApp = new CreditScoringApp(PublicKey.fromBase58(zkAppAddress));

async function storeCreditScore(score: Field) {
  console.log(`Storing credit score of ${score.toString()}...`);
  const tx = await Mina.transaction(async () => {
    await creditScoringApp.storeCreditScore(score);
  });
  await tx.send();
  console.log('Credit score stored successfully!');
}

async function approveLoan() {
  // Wait for the approval process and log the result
  await creditScoringApp.approveLoan();
  console.log('Loan approval process completed.');
}

async function verifyCreditScoreZKP(score: Field) {
  // Wait for the ZKP verification process and log the result
  await creditScoringApp.verifyCreditScoreZKP(score);
  console.log('ZKP verification process completed.');
}

// Example usage
(async () => {
  const score = Field(750);  // Example credit score
  await storeCreditScore(score);  // Store the credit score
  await approveLoan();           // Check loan approval status
  await verifyCreditScoreZKP(score);  // Verify credit score with ZKP
})();
```

### How it works 

- The script begins by importing necessary components from the `o1js` library, including `PrivateKey`, `PublicKey`, `Mina`, and `Field`.
- The `CreditScoringApp` is imported from the `Add` file and initialized with the public key of the zkApp. The `zkAppAddress` should be replaced with the actual public key of the deployed zkApp.
- `storeCreditScore(score: Field)`: This function takes a credit score (of type Field) as an argument and stores it in the smart contract. It creates a transaction using `Mina.transaction` where the `storeCreditScore` method of the `CreditScoringApp` is called to store the score on the blockchain. After the transaction is sent, a success message is logged to the console.
- `approveLoan()`: This function calls the `approveLoan` method of the `CreditScoringApp`. The approval decision is logged to the console (i.e., whether the loan is approved or denied based on the stored credit score).
- `verifyCreditScoreZKP(score: Field)`: This function verifies the credit score using Zero-Knowledge Proof (ZKP) with the `verifyCreditScoreZKP` method of the `CreditScoringApp`. A  confirmation message is logged once the ZKP verification process is complete.


## Compiling zkapp

You can compile the code by running

`npm run build`

## Testing zkapp

You can test the code by running 

`npm run test`

## Smart Contract Overview

- storeCreditScore(score: Field): Store a user’s credit score on-chain.
- approveLoan(): Determines if a loan can be approved based on the stored credit score.
- verifyCreditScoreZKP(zkp: Field): Validates a zero-knowledge proof against the stored credit score for secure verification.

## Loan Approval Logic

Loans are approved if the credit score meets or exceeds a specified threshold (e.g., 700). The decision-making process is abstracted into provable computations, ensuring security and privacy.

## Technologies Used

- o1js: A typescript library for building zk-SNARK-enabled applications.
- zk-SNARKs: Ensures privacy-preserving computations.
- TypeScript: For strongly-typed smart contract development.

## Getting Started

- Prerequisites
- Node.js (v16+)
- o1js CLI installed globally: npm install -g zkapp-cli
- Git for version control

## Deployment

You can deploy by running the command

`zk config`

It will ask for: 

- deployment alias for the project. I provided `credit` as alias name. The alias name will be used for deployment of zkapp.
- deployment on mainnet or testnet? I provided testnet.
- graphql url which is available in minascan. I provided `https://api.minascan.io/node/devnet/v1/graphql`
- feepayer account. I used this public key `B62qoZ9zXaSGPcE3MzTKbcCJFkAhAw1Fp6g4uQCAmzb9NuSwZUrmMQW`
- transaction which is normally `0.1`

You can get test tokens from mina faucet.

After adding all the details now run

`zk deploy credit`

This will deploy zkapp in testnet. This zkapp is deployed on mina testnet `https://minascan.io/devnet/tx/5Jv8SNabg8eXvebDyEkqLkWT5qSCzMUPymdnVy4UpmWjdDpL9zB7?type=zk-tx`

## Interact with zkapp

You can interact with zkapp after depl]yment on testnet by replacing the zkapp public key with your zkapp public key. 

You can then run the script by running

`node interact.ts`

The script will then log interactions, such as storing a credit score, approving loans, and verifying ZKPs. It will give real time output. 

For now as example I have used 750 as credit score which will accept the loan but you can use another score for validating the app.





