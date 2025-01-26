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

- deployment alias for the project. I provided credit as alias name. The alias name will be used for deployment of zkapp.
- deployment on mainnet or testnet? I provided testnet.
- graphql url which is available in minascan. I provided `https://api.minascan.io/node/devnet/v1/graphql`
- feepayer account. I used my wallet address `B62qoZ9zXaSGPcE3MzTKbcCJFkAhAw1Fp6g4uQCAmzb9NuSwZUrmMQW`
- transaction which is normally `0.1`

You can get test tokens from mina faucet.

After adding all the details now run

`zk deploy credit`

This will deploy zkapp in testnet. This zkapp is deployed on mina testnet `https://minascan.io/devnet/tx/5Jv8SNabg8eXvebDyEkqLkWT5qSCzMUPymdnVy4UpmWjdDpL9zB7?type=zk-tx`



